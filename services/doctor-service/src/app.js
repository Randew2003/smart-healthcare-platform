const express = require("express");
const doctorRoutes = require("./routes/doctorRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Doctor Service API is running");
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/doctors/:doctorId/prescriptions", prescriptionRoutes);

module.exports = app;