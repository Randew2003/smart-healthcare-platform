const express = require('express');
const router = express.Router();

const {
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
} = require('../controllers/patientController');

router.post('/register', registerPatient);
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

module.exports = router;