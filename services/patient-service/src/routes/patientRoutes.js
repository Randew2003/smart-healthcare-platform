import { Router } from "express";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  addMedicalHistory,
  getMedicalHistory,
  addPrescription,
  getPrescriptions,
  addReport,
  getReports
} from "../controllers/patientController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("patient"));

router.post("/profile", createProfile);
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

router.post("/medical-history", addMedicalHistory);
router.get("/medical-history", getMedicalHistory);

router.post("/prescriptions", addPrescription);
router.get("/prescriptions", getPrescriptions);

router.post("/reports", addReport);
router.get("/reports", getReports);

export default router;