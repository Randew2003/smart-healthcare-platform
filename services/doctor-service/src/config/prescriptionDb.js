const mongoose = require("mongoose");

const prescriptionConnection = mongoose.createConnection();

const connectPrescriptionDB = async () => {
  try {
    const conn = await prescriptionConnection.openUri(process.env.MONGO_URI);
    console.log("Prescription MongoDB Connected:", conn.host);
  } catch (error) {
    console.error("Prescription database connection failed:", error.message);
    process.exit(1);
  }
};

const getPrescriptionConnection = () => prescriptionConnection;

module.exports = {
  connectPrescriptionDB,
  getPrescriptionConnection,
};
