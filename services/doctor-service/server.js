require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { connectPrescriptionDB } = require("./src/config/prescriptionDb");

const PORT = process.env.PORT || 4005;

const startServer = async () => {
  await connectDB();
  await connectPrescriptionDB();

  app.listen(PORT, () => {
    console.log(`Doctor Service running on port ${PORT}`);
  });
};

startServer();
