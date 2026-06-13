const express = require('express');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  updateMedicationAdherence
} = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All prescription routes require authentication

router.post('/', restrictTo('doctor'), createPrescription);
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);
router.get('/patient/:patientId', getPrescriptionsByPatient);
router.get('/doctor', restrictTo('doctor'), getPrescriptionsByDoctor);
router.put('/:id/medications/:medId/take', restrictTo('patient'), updateMedicationAdherence);

module.exports = router;
