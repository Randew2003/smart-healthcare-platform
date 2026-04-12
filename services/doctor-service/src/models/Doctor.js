const mongoose = require("mongoose");

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
    }
  },
  {
    timestamps: true,// automatically add createdAt and updatedAt

  }
);

module.exports = mongoose.model("Doctor", doctorSchema);