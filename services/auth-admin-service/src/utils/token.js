import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      doctorVerificationStatus: user.doctorVerificationStatus
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
