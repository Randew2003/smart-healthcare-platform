const mongoose = require("mongoose");
const { getPrescriptionConnection } = require("../config/prescriptionDb");

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
    prescriptionDate: {
      type: Date,
      required: [true, "Prescription date is required"],
      default: Date.now,
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

    requiresMedicalReport: {
      type: Boolean,
      default: false,
    },
    medicalReportRequestNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const prescriptionConnection = getPrescriptionConnection();

module.exports =
  prescriptionConnection.models.Prescription ||
  prescriptionConnection.model("Prescription", prescriptionSchema);
