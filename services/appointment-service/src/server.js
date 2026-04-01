import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 4001;

// Connect database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});