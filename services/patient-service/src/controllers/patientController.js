import Patient from "../models/Patient.js";

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

export async function getReports(req, res) {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select("reports");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found." });
    }

    return res.json(patient.reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}