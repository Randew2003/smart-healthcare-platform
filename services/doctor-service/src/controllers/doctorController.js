const Doctor = require("../models/Doctor");

// CREATE doctor profile
// POST /api/doctors
exports.createDoctor = async (req, res) => {
  try {
    // Create new doctor using request body
    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET all doctors
// GET /api/doctors
exports.getAllDoctors = async (req, res) => {
  try {
    // Fetch all doctors sorted by latest
    const doctors = await Doctor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single doctor by ID
// GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    // Find doctor by ID
    const doctor = await Doctor.findById(req.params.id);

    // If not found
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE doctor
// PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    // Update doctor and return updated data
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // return updated document
        runValidators: true // validate before update
      }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE doctor
// DELETE /api/doctors/:id
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD availability slot
exports.addAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.availability.push({ day, startTime, endTime });
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability slot added successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET doctor availability
exports.getAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("name specialization availability");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      availabilityCount: doctor.availability.length,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE one availability slot
exports.updateAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime, isBooked } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const slot = doctor.availability.id(req.params.slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Availability slot not found",
      });
    }

    if (day !== undefined) slot.day = day;
    if (startTime !== undefined) slot.startTime = startTime;
    if (endTime !== undefined) slot.endTime = endTime;
    if (isBooked !== undefined) slot.isBooked = isBooked;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability slot updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE one availability slot
exports.deleteAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const slot = doctor.availability.id(req.params.slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Availability slot not found",
      });
    }

    slot.deleteOne();
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability slot deleted successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};