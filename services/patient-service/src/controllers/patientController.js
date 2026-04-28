import Patient from "../models/Patient.js";
import fs from "fs";
import path from "path";

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://doctor-service:4005";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4002/api/notifications/event";

function ensureUploadDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getUploadsBaseDir() {
  // Store uploads in a folder inside the container/app directory.
  return path.join(process.cwd(), "uploads");
}

function buildReportFilePath(fileNameOnDisk) {
  return path.join(getUploadsBaseDir(), "reports", fileNameOnDisk);
}

async function findOrCreatePatientProfileFromAuth(user) {
  if (!user?.id) return null;

  let patient = await Patient.findOne({ userId: user.id });
  if (patient) return patient;

  patient = await Patient.create({
    userId: user.id,
    fullName: user.fullName || "Patient",
    email: user.email || `${user.id}@placeholder.local`,
    phone: user.phone || "",
    dob: null,
    gender: "",
    address: "",
    bloodGroup: "",
    allergies: [],
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  return patient;
}

async function sendDoctorReportNotification({ doctorId, patient, report }) {
  if (!doctorId || !patient || !report) return;

  try {
    const doctorResponse = await fetch(
      `${DOCTOR_SERVICE_URL}/api/doctors/${encodeURIComponent(doctorId)}`
    );

    if (!doctorResponse.ok) return;

    const doctor = await doctorResponse.json();

    await fetch(NOTIFICATION_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "REPORT_UPLOADED",
        patient: {
          id: patient.userId || String(patient._id || ""),
          name: patient.fullName || "",
          email: patient.email || "",
          phone: patient.phone || ""
        },
        doctor: {
          id: String(doctorId),
          name: doctor?.name || "",
          email: doctor?.email || "",
          phone: doctor?.phone || ""
        },
        report: {
          id: String(report._id || ""),
          fileName: report.fileName || "",
          uploadedAt: report.uploadedAt || new Date().toISOString()
        }
      })
    });
  } catch (error) {
    console.error("Failed to send doctor report notification:", error.message);
  }
}


export async function createProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      address,
      bloodGroup,
      allergies,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    const existingProfile = await Patient.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ message: "Patient profile already exists." });
    }

    const patient = await Patient.create({
      userId,
      fullName: fullName || req.user.fullName || "",
      email: email || req.user.email || "",
      phone: phone || req.user.phone || "",
      dob: dob || null,
      gender: gender || "",
      address: address || "",
      bloodGroup: bloodGroup || "",
      allergies: Array.isArray(allergies) ? allergies : [],
      emergencyContactName: emergencyContactName || "",
      emergencyContactPhone: emergencyContactPhone || ""
    });

    return res.status(201).json({
      message: "Patient profile created successfully.",
      patient
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMyProfile(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.json(patient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      address,
      bloodGroup,
      allergies,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    const patient = await Patient.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    if (fullName !== undefined) patient.fullName = fullName;
    if (email !== undefined) patient.email = email.toLowerCase();
    if (phone !== undefined) patient.phone = phone;
    if (dob !== undefined) patient.dob = dob;
    if (gender !== undefined) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (allergies !== undefined) patient.allergies = Array.isArray(allergies) ? allergies : patient.allergies;
    if (emergencyContactName !== undefined) patient.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) patient.emergencyContactPhone = emergencyContactPhone;

    await patient.save();

    return res.json({
      message: "Patient profile updated successfully.",
      patient
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addMedicalHistory(req, res) {
  try {
    const { condition, notes, diagnosedDate } = req.body;

    if (!condition) {
      return res.status(400).json({ message: "Condition is required." });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    patient.medicalHistory.push({
      condition,
      notes: notes || "",
      diagnosedDate: diagnosedDate || null
    });

    await patient.save();

    return res.status(201).json({
      message: "Medical history added successfully.",
      medicalHistory: patient.medicalHistory
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMedicalHistory(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select("medicalHistory");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.json(patient.medicalHistory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addPrescription(req, res) {
  try {
    const { doctorId, medication, dosage, instructions } = req.body;

    if (!doctorId || !medication) {
      return res.status(400).json({ message: "doctorId and medication are required." });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    patient.prescriptions.push({
      doctorId,
      medication,
      dosage: dosage || "",
      instructions: instructions || ""
    });

    await patient.save();

    return res.status(201).json({
      message: "Prescription added successfully.",
      prescriptions: patient.prescriptions
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPrescriptions(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select("prescriptions");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.json(patient.prescriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addReport(req, res) {
  try {
    const { fileName, fileUrl } = req.body;

    if (!fileName) {
      return res.status(400).json({ message: "fileName is required." });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    patient.reports.push({
      fileName,
      fileUrl: fileUrl || ""
    });

    await patient.save();

    return res.status(201).json({
      message: "Report added successfully.",
      reports: patient.reports
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Upload a report file (multipart/form-data)
// POST /api/patients/reports/upload
export async function uploadReport(req, res) {
  try {
    const patient = await findOrCreatePatientProfileFromAuth(req.user);

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    const doctorId = String(req.body?.doctorId || "").trim();
    const prescriptionId = String(req.body?.prescriptionId || "").trim();

    if (!doctorId || !prescriptionId) {
      return res.status(400).json({ message: "doctorId and prescriptionId are required." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "report file is required." });
    }

    // Persist report metadata.
    patient.reports.push({
      fileName: file.originalname,
      fileUrl: file.filename,
      doctorId,
      prescriptionId,
      uploadedAt: new Date()
    });

    await patient.save();

    const saved = patient.reports[patient.reports.length - 1];

    sendDoctorReportNotification({
      doctorId,
      patient,
      report: saved
    });

    return res.status(201).json({
      message: "Report uploaded successfully.",
      report: saved
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET /api/patients/reports/:reportId/file (patient)
export async function downloadMyReportFile(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select("reports");
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    const reportId = String(req.params.reportId || "").trim();
    const report = (patient.reports || []).find((r) => String(r._id) === reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    const fileNameOnDisk = String(report.fileUrl || "").trim();
    if (!fileNameOnDisk) {
      return res.status(404).json({ message: "Report file is missing." });
    }

    const fullPath = buildReportFilePath(fileNameOnDisk);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Report file not found on server." });
    }

    return res.download(fullPath, report.fileName);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET /api/patients/doctor-view/:patientId/reports/:reportId/file (doctor/admin)
export async function downloadPatientReportFileForDoctor(req, res) {
  try {
    const patientId = String(req.params.patientId || "").trim();
    const reportId = String(req.params.reportId || "").trim();

    let patient = await Patient.findOne({ userId: patientId }).select("reports");
    if (!patient) {
      patient = await Patient.findById(patientId).select("reports");
    }
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const report = (patient.reports || []).find((r) => String(r._id) === reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    const fileNameOnDisk = String(report.fileUrl || "").trim();
    if (!fileNameOnDisk) {
      return res.status(404).json({ message: "Report file is missing." });
    }

    const fullPath = buildReportFilePath(fileNameOnDisk);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Report file not found on server." });
    }

    return res.download(fullPath, report.fileName);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// POST /api/patients/doctor-view/:patientId/reports/:reportId/feedback
// Body: { doctorId, feedback }
export async function leaveReportFeedback(req, res) {
  try {
    const patientId = String(req.params.patientId || "").trim();
    const reportId = String(req.params.reportId || "").trim();
    const doctorId = String(req.body?.doctorId || "").trim();
    const feedback = String(req.body?.feedback || "").trim();

    if (!doctorId || !feedback) {
      return res.status(400).json({ message: "doctorId and feedback are required." });
    }

    let patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      patient = await Patient.findById(patientId);
    }
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const report = (patient.reports || []).find((r) => String(r._id) === reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Ensure the feedback is written by the doctor that the report was shared with.
    if (String(report.doctorId || "") !== doctorId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    report.doctorFeedback = feedback;
    report.doctorFeedbackAt = new Date();
    await patient.save();

    return res.json({
      message: "Feedback saved.",
      report
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Ensure upload directories exist on module load.
ensureUploadDir(path.join(getUploadsBaseDir(), "reports"));

export async function getReports(req, res) {
  try {
    const patient = await findOrCreatePatientProfileFromAuth(req.user);

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.json(patient.reports || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getDoctorReportsFeed(req, res) {
  try {
    const doctorId = String(req.query?.doctorId || "").trim();

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required." });
    }

    const patients = await Patient.find({ "reports.doctorId": doctorId }).select(
      "userId fullName reports"
    );

    const reports = patients
      .flatMap((patient) =>
        (patient.reports || [])
          .filter((report) => String(report?.doctorId || "") === doctorId)
          .map((report) => ({
            ...report.toObject(),
            patientId: patient.userId || String(patient._id || ""),
            patientProfileId: String(patient._id || ""),
            patientName: patient.fullName || "Unknown patient"
          }))
      )
      .sort((a, b) => {
        const aTime = new Date(a?.uploadedAt || 0).getTime();
        const bTime = new Date(b?.uploadedAt || 0).getTime();
        return bTime - aTime;
      });

    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET patient profile for doctor/admin view (lookup by patient userId, fallback to profile _id)
export const getPatientProfileForDoctor = async (req, res) => {
  try {
    const patientId = String(req.params.patientId || "").trim();

    let patient = await Patient.findOne({ userId: patientId }).select(
      "fullName email phone dob gender address bloodGroup allergies"
    );

    if (!patient) {
      patient = await Patient.findById(patientId).select(
        "fullName email phone dob gender address bloodGroup allergies"
      );
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET patient medical history for doctor/admin view
export const getPatientMedicalHistoryForDoctor = async (req, res) => {
  try {
    const patientId = String(req.params.patientId || "").trim();

    let patient = await Patient.findOne({ userId: patientId }).select("medicalHistory");

    if (!patient) {
      patient = await Patient.findById(patientId).select("medicalHistory");
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient.medicalHistory || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET patient prescriptions for doctor/admin view
export const getPatientPrescriptionsForDoctor = async (req, res) => {
  try {
    const patientId = String(req.params.patientId || "").trim();

    let patient = await Patient.findOne({ userId: patientId }).select("prescriptions");

    if (!patient) {
      patient = await Patient.findById(patientId).select("prescriptions");
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient.prescriptions || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET patient reports for doctor/admin view
export const getPatientReportsForDoctor = async (req, res) => {
  try {
    const patientId = String(req.params.patientId || "").trim();

    let patient = await Patient.findOne({ userId: patientId }).select("reports");

    if (!patient) {
      patient = await Patient.findById(patientId).select("reports");
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient.reports || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
