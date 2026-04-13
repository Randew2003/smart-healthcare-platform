const express = require("express");

// Import controller functions
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  addAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability
} = require("../controllers/doctorController");

const router = express.Router();

// Doctor profile routes
router.post("/", createDoctor); // Route to create doctor(POST /api/doctors)
router.get("/", getAllDoctors); // Route to get all doctors(GET /api/doctors)
router.get("/:id", getDoctorById); // Route to get single doctor by ID(GET /api/doctors/:id)
router.put("/:id", updateDoctor); //  Route to update doctor(PUT /api/doctors/:id)
router.delete("/:id", deleteDoctor); // Route to delete doctor(DELETE /api/doctors/:id)

// Availability routes
router.post("/:id/availability", addAvailability); // Route to add availability for a doctor(POST /api/doctors/:id/availability)
router.get("/:id/availability", getAvailability); // Route to get availability for a doctor(GET /api/doctors/:id/availability)
router.put("/:id/availability/:slotId", updateAvailability); // Route to update availability for a doctor(PUT /api/doctors/:id/availability/:slotId)
router.delete("/:id/availability/:slotId", deleteAvailability); // Route to delete availability for a doctor(DELETE /api/doctors/:id/availability/:slotId)

module.exports = router;