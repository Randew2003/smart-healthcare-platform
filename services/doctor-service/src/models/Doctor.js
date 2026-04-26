const mongoose = require("mongoose");

// Availability sub-schema for doctor's available time slots
const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      trim: true,
      default: "",
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    }
  },
  { _id: true }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Doctor email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    hospital: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationNotes: {
      type: String,
      trim: true,
      default: "",
    },

    availability: [availabilitySchema]
  },
  {
    timestamps: true,// automatically add createdAt and updatedAt

  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
