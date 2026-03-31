import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    if (req.user.role === "doctor" && req.user.doctorVerificationStatus !== "verified") {
      return res.status(403).json({ message: "Doctor account is pending admin approval." });
    }
    if (req.user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated." });
    }
    next();
  };
}
