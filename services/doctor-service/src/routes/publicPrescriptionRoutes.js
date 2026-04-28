const express = require("express");
const Prescription = require("../models/prescription");

const router = express.Router();

// GET /api/prescriptions/patient/:patientId
// Public endpoint used by the patient UI to list their prescriptions.
router.get("/patient/:patientId", async (req, res) => {
  try {
    const patientId = String(req.params.patientId || "").trim();
    if (!patientId) {
      return res.status(400).json({ success: false, message: "patientId is required" });
    }

    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
