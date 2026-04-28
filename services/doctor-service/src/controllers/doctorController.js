const Doctor = require("../models/Doctor");

function getDayFromDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function addSixHours(timeValue) {
  if (!/^\d{2}:\d{2}$/.test(String(timeValue || ""))) {
    return "";
  }

  const [hours, minutes] = String(timeValue).split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + 6 * 60;
  const nextHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

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
    const { date, startTime } = req.body;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Date and start time are required",
      });
    }

    const day = getDayFromDate(date);

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability date",
      });
    }

    const duplicateDay = doctor.availability.find(
      (slot) => String(slot?.day || "").toLowerCase() === day.toLowerCase()
    );

    if (duplicateDay) {
      return res.status(400).json({
        success: false,
        message: `Availability for ${day} already exists. Please choose a different date.`,
      });
    }

    const endTime = addSixHours(startTime);

    if (!endTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time",
      });
    }

    doctor.availability.push({ date, day, startTime, endTime });
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
    const { date, startTime, isBooked } = req.body;

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

    if (date !== undefined) {
      const nextDay = getDayFromDate(date);

      if (!nextDay) {
        return res.status(400).json({
          success: false,
          message: "Invalid availability date",
        });
      }

      const duplicateDay = doctor.availability.find(
        (entry) =>
          String(entry?._id) !== String(slot._id) &&
          String(entry?.day || "").toLowerCase() === nextDay.toLowerCase()
      );

      if (duplicateDay) {
        return res.status(400).json({
          success: false,
          message: `Availability for ${nextDay} already exists. Please choose a different date.`,
        });
      }

      slot.date = date;
      slot.day = nextDay;
    }

    if (startTime !== undefined) {
      const nextEndTime = addSixHours(startTime);

      if (!nextEndTime) {
        return res.status(400).json({
          success: false,
          message: "Invalid start time",
        });
      }

      slot.startTime = startTime;
      slot.endTime = nextEndTime;
    }

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

// GET only verified doctors
exports.getVerifiedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).sort({ createdAt: -1 });

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

// GET pending doctors for admin review
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: "pending" }).sort({ createdAt: -1 });

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

// VERIFY doctor
exports.verifyDoctor = async (req, res) => {
  try {
    const { verificationNotes } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verificationStatus: "verified",
        verificationNotes: verificationNotes || "Doctor verified successfully",
      },
      {
        new: true,
        runValidators: true,
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
      message: "Doctor verified successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// REJECT doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const { verificationNotes } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: false,
        verificationStatus: "rejected",
        verificationNotes: verificationNotes || "Doctor verification rejected",
      },
      {
        new: true,
        runValidators: true,
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
      message: "Doctor rejected successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET appointments for a doctor from appointment-service
// GET /api/doctors/:id/appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    // First check whether doctor exists in doctor-service
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Call appointment-service API
    const response = await fetch(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/doctor/${req.params.id}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Failed to fetch appointments from appointment-service",
      });
    }

    const appointments = await response.json();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ACCEPT appointment by updating status in appointment-service
// PUT /api/doctors/:id/appointments/:appointmentId/accept
exports.acceptAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${req.params.appointmentId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Confirmed",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to accept appointment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment accepted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// COMPLETE appointment by updating status in appointment-service
// PUT /api/doctors/:id/appointments/:appointmentId/complete
exports.completeAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${req.params.appointmentId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Completed",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to complete appointment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REJECT appointment by updating status in appointment-service
// PUT /api/doctors/:id/appointments/:appointmentId/reject
exports.rejectAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${req.params.appointmentId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to reject appointment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient profile from patient-service
// GET /api/doctors/:doctorId/patients/:patientId/profile
exports.getPatientProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/${req.params.patientId}/profile`
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch patient profile",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient medical history from patient-service
// GET /api/doctors/:doctorId/patients/:patientId/medical-history
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/${req.params.patientId}/medical-history`
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch medical history",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient reports from patient-service
// GET /api/doctors/:doctorId/patients/:patientId/reports
exports.getPatientReports = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/${req.params.patientId}/reports`
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch reports",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient prescriptions from patient-service
// GET /api/doctors/:doctorId/patients/:patientId/prescriptions
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/${req.params.patientId}/prescriptions`
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch prescriptions",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient profile from patient-service
exports.getPatientProfile = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const headers = {};
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/api/patients/doctor-view/${patientId}/profile`,
      { headers }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch patient profile",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient medical history from patient-service
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const headers = {};
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/api/patients/doctor-view/${patientId}/medical-history`,
      { headers }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch patient medical history",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient reports from patient-service
exports.getPatientReports = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const headers = {};
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/api/patients/doctor-view/${patientId}/reports`,
      { headers }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch patient reports",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET patient prescriptions from patient-service
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const headers = {};
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(
      `${process.env.PATIENT_SERVICE_URL}/api/patients/doctor-view/${patientId}/prescriptions`,
      { headers }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to fetch patient prescriptions",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET doctor dashboard stats
// GET /api/doctors/:id/dashboard
exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Check doctor exists in doctor-service
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get prescriptions count from doctor-service database
    const Prescription = require("../models/prescription");
    const totalPrescriptions = await Prescription.countDocuments({ doctorId });

    // Get appointments from appointment-service
    const response = await fetch(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/doctor/${doctorId}`
    );

    let appointments = [];

    if (response.ok) {
      appointments = await response.json();
    }

    // Calculate appointment stats
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (appointment) => appointment.status === "Pending"
    ).length;
    const confirmedAppointments = appointments.filter(
      (appointment) => appointment.status === "Confirmed"
    ).length;
    const cancelledAppointments = appointments.filter(
      (appointment) => appointment.status === "Cancelled"
    ).length;
    const completedAppointments = appointments.filter(
      (appointment) => appointment.status === "Completed"
    ).length;

    // Availability stats from doctor-service
    const totalAvailabilitySlots = doctor.availability.length;
    const bookedAvailabilitySlots = doctor.availability.filter(
      (slot) => slot.isBooked === true
    ).length;
    const freeAvailabilitySlots = doctor.availability.filter(
      (slot) => slot.isBooked === false
    ).length;

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          verificationStatus: doctor.verificationStatus,
        },
        stats: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          cancelledAppointments,
          completedAppointments,
          totalPrescriptions,
          totalAvailabilitySlots,
          bookedAvailabilitySlots,
          freeAvailabilitySlots,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
