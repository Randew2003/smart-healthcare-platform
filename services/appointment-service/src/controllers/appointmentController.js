import Appointment from '../models/appointmentModel.js';

// Create appointment
export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

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

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time
    });

    // Generate meeting link (for video consultation)
    appointment.meetingLink = `https://meet.jit.si/appointment-${appointment._id}`;

    await appointment.save();

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

    const appointments = await Appointment.find({ patientId });

    res.json(appointments);

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