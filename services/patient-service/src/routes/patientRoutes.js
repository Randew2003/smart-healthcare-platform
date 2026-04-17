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
  getReports,

  // Doctor-specific endpoints
  getPatientProfileForDoctor,
  getPatientMedicalHistoryForDoctor,
  getPatientPrescriptionsForDoctor,
  getPatientReportsForDoctor
} from "../controllers/patientController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Doctor-view routes
// These routes allow doctors (or admins) to view patient data by patient userId.
router.get(
  "/doctor-view/:patientId/profile",
  protect,
  authorize("doctor", "admin"),
  getPatientProfileForDoctor
);
router.get(
  "/doctor-view/:patientId/medical-history",
  protect,
  authorize("doctor", "admin"),
  getPatientMedicalHistoryForDoctor
);
router.get(
  "/doctor-view/:patientId/prescriptions",
  protect,
  authorize("doctor", "admin"),
  getPatientPrescriptionsForDoctor
);
router.get(
  "/doctor-view/:patientId/reports",
  protect,
  authorize("doctor", "admin"),
  getPatientReportsForDoctor
);

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