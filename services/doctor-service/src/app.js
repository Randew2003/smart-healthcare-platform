const express = require("express");
const doctorRoutes = require("./routes/doctorRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const publicPrescriptionRoutes = require("./routes/publicPrescriptionRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Doctor Service API is running");
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/doctors/:doctorId/prescriptions", prescriptionRoutes);
app.use("/api/prescriptions", publicPrescriptionRoutes);

module.exports = app;