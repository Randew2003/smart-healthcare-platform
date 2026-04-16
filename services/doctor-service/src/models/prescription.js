const mongoose = require("mongoose");

// Prescription schema
const prescriptionSchema = new mongoose.Schema(
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
      trim: true,
      default: "",
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    medicines: [
      {
        name: {
          type: String,
          required: [true, "Medicine name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, "Dosage is required"],
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, "Frequency is required"],
          trim: true,
        },
        duration: {
          type: String,
          required: [true, "Duration is required"],
          trim: true,
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);