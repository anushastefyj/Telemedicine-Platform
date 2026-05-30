const express = require('express');
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All appointment routes require authentication

router.post('/', bookAppointment);
router.get('/', getMyAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

// Doctor-only appointment lifecycle routes
router.put('/:id/confirm', restrictTo('doctor'), confirmAppointment);
router.put('/:id/complete', restrictTo('doctor'), completeAppointment);

module.exports = router;
