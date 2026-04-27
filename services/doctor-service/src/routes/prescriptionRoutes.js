const express = require("express");
const {
  createPrescription,
  getDoctorPrescriptions,
  getPrescriptionsByPatientId,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");

const router = express.Router({ mergeParams: true });

// Create prescription
router.post("/", createPrescription);

// Get all prescriptions of a doctor
router.get("/", getDoctorPrescriptions);

// Get prescriptions by patient ID
router.get("/patient/:patientId", getPrescriptionsByPatientId);

// Get one prescription
router.get("/:prescriptionId", getPrescriptionById);

// Update prescription
router.put("/:prescriptionId", updatePrescription);

// Delete prescription
router.delete("/:prescriptionId", deletePrescription);

module.exports = router;
