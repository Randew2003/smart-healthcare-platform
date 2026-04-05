import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, default: "", trim: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    diagnosedDate: { type: Date, default: null }
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
    issuedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: ""
    },
    address: { type: String, default: "", trim: true },
    bloodGroup: { type: String, default: "", trim: true },
    allergies: [{ type: String, trim: true }],
    emergencyContactName: { type: String, default: "", trim: true },
    emergencyContactPhone: { type: String, default: "", trim: true },
    medicalHistory: [medicalHistorySchema],
    prescriptions: [prescriptionSchema],
    reports: [reportSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);