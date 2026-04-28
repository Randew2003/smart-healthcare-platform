import { Router } from "express";
import multer from "multer";
import path from "path";
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

  uploadReport,
  downloadMyReportFile,
  downloadPatientReportFileForDoctor,
  leaveReportFeedback,

  // Doctor-specific endpoints
  getDoctorReportsFeed,
  getPatientProfileForDoctor,
  getPatientMedicalHistoryForDoctor,
  getPatientPrescriptionsForDoctor,
  getPatientReportsForDoctor
} from "../controllers/patientController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
const MAX_REPORT_FILE_SIZE = 20 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(process.cwd(), "uploads", "reports"));
    },
    filename: (_req, file, cb) => {
      const safeOriginal = String(file.originalname || "report")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .slice(0, 120);
      cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeOriginal}`);
    }
  }),
  limits: { fileSize: MAX_REPORT_FILE_SIZE }
});

// Doctor-view routes
// These routes allow doctors (or admins) to view patient data by patient userId.
router.get(
  "/doctor-view/reports",
  protect,
  authorize("doctor", "admin"),
  getDoctorReportsFeed
);
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

router.get(
  "/doctor-view/:patientId/reports/:reportId/file",
  protect,
  authorize("doctor", "admin"),
  downloadPatientReportFileForDoctor
);

router.post(
  "/doctor-view/:patientId/reports/:reportId/feedback",
  protect,
  authorize("doctor", "admin"),
  leaveReportFeedback
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

router.post("/reports/upload", upload.single("file"), uploadReport);
router.get("/reports/:reportId/file", downloadMyReportFile);

export default router;
