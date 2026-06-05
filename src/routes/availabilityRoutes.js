const express = require('express');
const router = express.Router();
const {
  updateAvailability,
  getDoctorAvailability,
  getAvailableSlots,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/auth');

router.put('/me/availability', protect, authorize('doctor'), updateAvailability);
router.get('/:id/availability', getDoctorAvailability);
router.get('/:id/available-slots', getAvailableSlots);

module.exports = router;
