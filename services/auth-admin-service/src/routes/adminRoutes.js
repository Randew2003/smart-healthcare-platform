import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { getAllUsers, getPendingDoctors, verifyDoctor, updateUser, toggleUserStatus, deleteUser } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.use(protect, authorize("admin"));
router.get("/users", getAllUsers);
router.get("/doctors/pending", getPendingDoctors);
router.patch("/doctors/:id/verify", verifyDoctor);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
