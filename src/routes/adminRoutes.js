const express = require('express');
const router = express.Router();
const {
  getUsers,
  getDoctorsList,
  getAppointmentsList,
  getRevenueStats,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/doctors', getDoctorsList);
router.get('/appointments', getAppointmentsList);
router.get('/revenue', getRevenueStats);
router.delete('/users/:id', deleteUser);

module.exports = router;
