require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Patient Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();