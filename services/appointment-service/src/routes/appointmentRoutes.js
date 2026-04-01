import express from 'express';
import {
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

// Create appointment
router.post('/', createAppointment);

// Get appointments by patient
router.get('/patient/:patientId', getAppointmentsByPatient);

// Get appointments by doctor
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

// Update appointment status (Confirm, Cancel, Complete)
router.put('/:id/status', updateAppointmentStatus);

// Cancel appointment
router.delete('/:id', cancelAppointment);

export default router;