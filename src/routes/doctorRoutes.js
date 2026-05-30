const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getMyProfile,
  updateMyProfile,
  getMyAppointments,
} = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected doctor-only routes
router.get('/me/profile', protect, restrictTo('doctor'), getMyProfile);
router.put('/me/profile', protect, restrictTo('doctor'), updateMyProfile);
router.get('/me/appointments', protect, restrictTo('doctor'), getMyAppointments);

module.exports = router;
