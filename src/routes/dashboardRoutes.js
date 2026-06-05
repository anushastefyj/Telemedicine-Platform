const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/doctor', authorize('doctor'), getDoctorDashboard);
router.get('/patient', authorize('patient'), getPatientDashboard);

module.exports = router;
