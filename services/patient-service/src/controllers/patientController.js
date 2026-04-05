const Patient = require('../models/patientModel');

const registerPatient = async (req, res) => {
  try {
    const { fullName, email, password, phone, age, gender, address } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const patient = await Patient.create({
      fullName,
      email,
      password,
      phone,
      age,
      gender,
      address,
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
};