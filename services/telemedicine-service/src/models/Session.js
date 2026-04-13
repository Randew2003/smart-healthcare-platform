const mongoose = require("mongoose");

// Session schema for telemedicine video consultations
const sessionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      trim: true,
    },
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      trim: true,
    },
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      trim: true,
    },
    roomId: {
      type: String,
      required: [true, "Room ID is required"],
      trim: true,
      unique: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    scheduledTime: {
      type: Date,
      required: [true, "Scheduled time is required"],
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);