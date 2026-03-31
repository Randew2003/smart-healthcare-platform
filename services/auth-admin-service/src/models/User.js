import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
    phone: { type: String, default: "" },
    doctorVerificationStatus: {
      type: String,
      enum: ["not_applicable", "pending", "verified", "rejected"],
      default: "not_applicable"
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    doctorApplication: {
      dob: { type: Date, default: null },
      licenseNumber: { type: String, default: "" },
      specialization: { type: String, default: "" },
      clinicName: { type: String, default: "" },
      yearsExperience: { type: String, default: "" },
      idProofFileName: { type: String, default: "" },
      medicalCertificateFileName: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
