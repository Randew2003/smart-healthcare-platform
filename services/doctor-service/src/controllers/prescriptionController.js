const Doctor = require("../models/Doctor");
const Prescription = require("../models/prescription");

// CREATE prescription
// POST /api/doctors/:doctorId/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create prescription with doctorId from route
    const prescription = await Prescription.create({
      ...req.body,
      doctorId,
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET all prescriptions for a doctor
// GET /api/doctors/:doctorId/prescriptions
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const prescriptions = await Prescription.find({ doctorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET prescriptions for a patient under a doctor
// GET /api/doctors/:doctorId/prescriptions/patient/:patientId
exports.getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const prescriptions = await Prescription.find({ doctorId, patientId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single prescription
// GET /api/doctors/:doctorId/prescriptions/:prescriptionId
exports.getPrescriptionById = async (req, res) => {
  try {
    const { doctorId, prescriptionId } = req.params;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctorId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE prescription
// PUT /api/doctors/:doctorId/prescriptions/:prescriptionId
exports.updatePrescription = async (req, res) => {
  try {
    const { doctorId, prescriptionId } = req.params;

    const prescription = await Prescription.findOneAndUpdate(
      { _id: prescriptionId, doctorId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE prescription
// DELETE /api/doctors/:doctorId/prescriptions/:prescriptionId
exports.deletePrescription = async (req, res) => {
  try {
    const { doctorId, prescriptionId } = req.params;

    const prescription = await Prescription.findOneAndDelete({
      _id: prescriptionId,
      doctorId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
