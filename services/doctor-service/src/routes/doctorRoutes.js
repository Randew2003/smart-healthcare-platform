const express = require("express");

// Import controller functions
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");

const router = express.Router();

// Route to create doctor
// POST /api/doctors
router.post("/", createDoctor);

// Route to get all doctors
// GET /api/doctors
router.get("/", getAllDoctors);

// Route to get single doctor by ID
// GET /api/doctors/:id
router.get("/:id", getDoctorById);

// Route to update doctor
// PUT /api/doctors/:id
router.put("/:id", updateDoctor);

// Route to delete doctor
// DELETE /api/doctors/:id
router.delete("/:id", deleteDoctor);

module.exports = router;