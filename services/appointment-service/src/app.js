import express from 'express';
import cors from 'cors';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route (very useful for Docker/K8s)
app.get('/', (req, res) => {
  res.send('Appointment Service is running...');
});

// Routes
app.use('/appointments', appointmentRoutes);

export default app;