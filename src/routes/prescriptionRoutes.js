const express = require('express');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPrescriptionsByPatient,
} = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All prescription routes require authentication

router.post('/', restrictTo('doctor'), createPrescription);
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);
router.get('/patient/:patientId', getPrescriptionsByPatient);

module.exports = router;
