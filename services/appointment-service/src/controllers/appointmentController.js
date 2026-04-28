import Appointment from '../models/appointmentModel.js';
import axios from "axios";

function timeToMinutes(timeValue) {
  if (!/^\d{2}:\d{2}$/.test(String(timeValue || ""))) {
    return null;
  }

  const [hours, minutes] = String(timeValue).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const safeMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildGeneratedTimeSlots(startTime, endTime, slotCount = 10) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes || slotCount <= 0) {
    return [];
  }

  const totalMinutes = endMinutes - startMinutes;
  const slotDuration = totalMinutes / slotCount;

  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = Math.round(startMinutes + (slotDuration * index));
    const slotEnd = Math.round(startMinutes + (slotDuration * (index + 1)));

    return {
      index: index + 1,
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotEnd)
    };
  });
}

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, notes, patientEmail, patientPhone } = req.body;

    // Basic validation
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prevent double booking (same doctor, same time)
    const existing = await Appointment.findOne({
      doctorId,
      date,
      time
    });

    if (existing) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    // Check doctor availability window and the generated 10 equal appointment slots
    let selectedSlot = null;
    let generatedTimeSlots = [];

    try {
      const availabilityRes = await axios.get(
      `http://doctor-service:4005/api/doctors/${doctorId}/availability`
    );

    const doctor = availabilityRes.data.data;

     selectedSlot = doctor.availability.find(
       (slot) =>
         slot.date === date &&
         time >= slot.startTime &&
         time < slot.endTime
      );

    if (!selectedSlot) {
      return res.status(400).json({
         message: "Doctor is not available at this selected time"
      });
    }

    generatedTimeSlots = buildGeneratedTimeSlots(selectedSlot.startTime, selectedSlot.endTime, 10);

    const selectedGeneratedSlot = generatedTimeSlots.find((slot) => slot.startTime === time);

    if (!selectedGeneratedSlot) {
      return res.status(400).json({
        message: "Please choose one of the available appointment times."
      });
    }

    const slotBookingCount = await Appointment.countDocuments({
      doctorId,
      date,
      time: { $in: generatedTimeSlots.map((slot) => slot.startTime) },
      status: { $ne: 'Cancelled' }
    });

    if (slotBookingCount >= generatedTimeSlots.length) {
      return res.status(400).json({
        message: "This doctor's availability is fully booked for the selected date."
      });
    }

    } catch (err) {
     console.error("Availability fetch failed:", err.message);

    return res.status(500).json({
       message: "Failed to check doctor availability"
    });
   }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      notes
    });

    // Generate meeting link (for video consultation)
    appointment.meetingLink = `https://meet.jit.si/appointment-${appointment._id}`;


    await appointment.save();

    // 🔥 FETCH DOCTOR DETAILS
    let doctorData = {};
    try {
      const doctorRes = await axios.get(`http://doctor-service:4005/api/doctors/${doctorId}`);
      doctorData = doctorRes.data.data;
    } catch (err) {
      console.error("Doctor fetch failed:", err.message);
    }

    // 🔔 SEND NOTIFICATION (NON-BLOCKING)
    axios.post("http://notification-service:4002/api/notifications/event", {
      type: "APPOINTMENT_BOOKED",
      patient: {
        email: patientEmail,
        phone: patientPhone
      },
      doctor: {
        email: doctorData?.email,
        phone: doctorData?.phone
      },
      appointmentTime: `${date} ${time}`
    }).catch(err => {
      console.error("Notification failed:", err.message);
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get appointments by patient
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId }).sort({ createdAt: -1 });

    // 🔥 Enrich with doctor data
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        try {
          const doctorRes = await axios.get(
            `http://doctor-service:4005/api/doctors/${appt.doctorId}`
          );

          const doctor = doctorRes.data.data;

          return {
            ...appt.toObject(),
            doctor: {
              name: doctor?.name,
              specialization: doctor?.specialization,
              email: doctor?.email
            }
          };
        } catch (err) {
          console.error("Doctor fetch failed:", err.message);

          return {
            ...appt.toObject(),
            doctor: null
          };
        }
      })
    );

    res.json(enrichedAppointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get appointments by doctor
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId }).sort({ createdAt: -1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
