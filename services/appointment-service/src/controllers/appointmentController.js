import Appointment from '../models/appointmentModel.js';
import axios from "axios";


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

    // 🔥 CHECK DOCTOR AVAILABILITY
    let selectedSlot = null;

    try {
      const availabilityRes = await axios.get(
      `http://doctor-service:4005/api/doctors/${doctorId}/availability`
    );

    const doctor = availabilityRes.data.data;

     selectedSlot = doctor.availability.find(
       (slot) =>
         slot.date === date &&
         time >= slot.startTime &&
         time < slot.endTime &&
         slot.isBooked === false
      );

    if (!selectedSlot) {
      return res.status(400).json({
         message: "Doctor is not available at this selected time"
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


    // 🔥 MARK SLOT AS BOOKED
    try {
       await axios.put(
          `http://doctor-service:4005/api/doctors/${doctorId}/availability/${selectedSlot._id}`,
        {
          isBooked: true
        }
      );
    } catch (err) {
       console.error("Failed to update slot booking:", err.message);
    }

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

    const appointments = await Appointment.find({ doctorId });

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