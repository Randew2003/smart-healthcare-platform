import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import crypto from "crypto";
import { sendPasswordResetOtpEmail } from "../utils/email.js";

export async function register(req, res) {
  try {
    const { fullName, email, password, role, phone, doctorApplication } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "fullName, email, password, and role are required." });
    }

    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const normalizedDoctorApplication = role === "doctor"
      ? {
          dob: doctorApplication?.dob || null,
          licenseNumber: doctorApplication?.licenseNumber || "",
          specialization: doctorApplication?.specialization || "",
          clinicName: doctorApplication?.clinicName || "",
          yearsExperience: doctorApplication?.yearsExperience || "",
          idProofFileName: doctorApplication?.idProofFileName || "",
          medicalCertificateFileName: doctorApplication?.medicalCertificateFileName || ""
        }
      : undefined;

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone: phone || "",
      doctorVerificationStatus: role === "doctor" ? "pending" : "not_applicable",
      doctorApplication: normalizedDoctorApplication
    });

    // Doctors must wait for admin verification before portal access.
    if (role === "doctor") {
      return res.status(201).json({
        message: "Doctor registration submitted. Wait for admin approval before login.",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          doctorVerificationStatus: user.doctorVerificationStatus,
          isActive: user.isActive,
          doctorApplication: user.doctorApplication
        }
      });
    }

    const token = signToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorVerificationStatus: user.doctorVerificationStatus,
        isActive: user.isActive
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is deactivated. Contact admin." });
    }

    if (user.role === "doctor" && user.doctorVerificationStatus === "rejected") {
      return res.status(403).json({
        message: "Doctor verification was rejected. Please contact admin for review."
      });
    }

    if (user.role === "doctor" && user.doctorVerificationStatus !== "verified") {
      return res.status(403).json({
        message: "Doctor account is pending admin approval. Please wait until verification is completed."
      });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorVerificationStatus: user.doctorVerificationStatus,
        isActive: user.isActive,
        doctorApplication: user.doctorApplication
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (user) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendPasswordResetOtpEmail({ to: user.email, fullName: user.fullName, otp });
    }

    return res.json({ message: "If an account exists for this email, a reset OTP has been sent." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
