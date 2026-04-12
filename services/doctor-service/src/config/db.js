const mongoose = require("mongoose");

// Function to connect to MongoDB database
const connectDB = async () => {
  try {
    // Connect using connection string from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, print host name
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    // If error occurs, print error message
    console.error("Database connection failed:", error.message);

    //stop the application
    process.exit(1);
  }
};
// Export function to use in server.js
module.exports = connectDB;