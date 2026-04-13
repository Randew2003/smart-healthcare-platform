const express = require("express");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

// Middleware to parse JSON request body
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Telemedicine Service API is running");
});

// Mount telemedicine session routes
app.use("/api/sessions", sessionRoutes);

module.exports = app;