import express from 'express';
import {
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  cancelAppointment,
  confirmAppointment
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

// Confirm appointment (after payment)
router.post('/:id/confirm', confirmAppointment);

// Cancel appointment
router.delete('/:id', cancelAppointment);

export default router;