import User from "../models/User.js";

export async function getAllUsers(_req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPendingDoctors(_req, res) {
  try {
    const doctors = await User.find({
      role: "doctor",
      doctorVerificationStatus: "pending"
    }).select("-password");
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function verifyDoctor(req, res) {
  try {
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be verified or rejected." });
    }

    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "doctor" },
      { doctorVerificationStatus: status },
      { new: true }
    ).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    return res.json({ message: `Doctor ${status}.`, doctor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use." });
      }
      updateData.email = email.toLowerCase();
    }
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ message: "User updated successfully.", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const userId = req.params.id;

    // First, get the current user to know their current status
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Toggle the status
    const newStatus = !currentUser.isActive;

    // Update with the toggled value
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: newStatus },
      { new: true }
    ).select("-password");

    return res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}.`,
      user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
