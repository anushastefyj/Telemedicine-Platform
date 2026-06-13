const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getMyProfile,
  updateMyProfile,
  getMyAppointments,
  updateAvailability,
  getAvailableSlots,
} = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDoctors);
// Protected doctor-only routes
router.get('/me/profile', protect, restrictTo('doctor'), getMyProfile);
router.put('/me/profile', protect, restrictTo('doctor'), updateMyProfile);
router.put('/me/availability', protect, restrictTo('doctor'), updateAvailability);
router.get('/me/appointments', protect, restrictTo('doctor'), getMyAppointments);

router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

module.exports = router;
