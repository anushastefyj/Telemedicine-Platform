const Appointment = require('../models/Appointment');
const { User, Doctor } = require('../models/User');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const { asyncHandler } = require('../middleware/error');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboard = asyncHandler(async (req, res, next) => {
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalDoctors = await User.countDocuments({ role: 'doctor' });
  const totalAppointments = await Appointment.countDocuments();
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
  const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
  const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

  // Paid appointments for revenue stats
  const paidAppointments = await Appointment.find({ paymentStatus: 'paid' }).populate('doctorId');
  const totalRevenue = paidAppointments.reduce((sum, app) => {
    const fee = app.doctorId && app.doctorId.consultationFee ? app.doctorId.consultationFee : 0;
    return sum + fee;
  }, 0);

  // Monthly breakdown
  const monthlyRevenueMap = {};
  paidAppointments.forEach((app) => {
    const fee = app.doctorId && app.doctorId.consultationFee ? app.doctorId.consultationFee : 0;
    const dateObj = new Date(app.date);
    const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + fee;
  });

  const monthlyRevenue = Object.keys(monthlyRevenueMap).map((month) => ({
    month,
    revenue: monthlyRevenueMap[month],
  })).sort((a, b) => b.month.localeCompare(a.month));

  // Top doctors by completed appointments count
  const topDocsAggregation = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const topDoctors = [];
  for (const item of topDocsAggregation) {
    const doc = await Doctor.findById(item._id);
    if (doc) {
      topDoctors.push({
        doctorId: doc._id,
        name: doc.name,
        appointments: item.count,
        revenue: item.count * (doc.consultationFee || 0),
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      pendingAppointments,
      totalRevenue,
      monthlyRevenue,
      topDoctors,
    },
  });
});

// @desc    Get Doctor Dashboard Analytics
// @route   GET /api/doctors/me/dashboard
// @access  Private (Doctor only)
exports.getDoctorDashboard = asyncHandler(async (req, res, next) => {
  const doctorId = req.user.id;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Today's appointments
  const todayAppointments = await Appointment.find({
    doctorId,
    date: { $gte: startOfToday, $lte: endOfToday },
  }).populate({ path: 'patientId', select: 'name email profilePic' });

  // Upcoming appointments
  const upcomingAppointments = await Appointment.find({
    doctorId,
    date: { $gt: endOfToday },
    status: { $in: ['pending', 'confirmed'] },
  }).populate({ path: 'patientId', select: 'name email profilePic' });

  // Monthly paid appointments for earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyPaidApps = await Appointment.find({
    doctorId,
    paymentStatus: 'paid',
    date: { $gte: startOfMonth },
  });

  const docProfile = await Doctor.findById(doctorId);
  const monthlyEarnings = monthlyPaidApps.length * (docProfile.consultationFee || 0);

  // Completed this month
  const completedThisMonth = await Appointment.countDocuments({
    doctorId,
    status: 'completed',
    date: { $gte: startOfMonth },
  });

  // Unique patients
  const uniquePatients = await Appointment.distinct('patientId', { doctorId });

  res.status(200).json({
    success: true,
    data: {
      todayAppointments,
      monthlyEarnings,
      totalPatients: uniquePatients.length,
      averageRating: docProfile.rating || 0,
      upcomingAppointments,
      completedThisMonth,
    },
  });
});

// @desc    Get Patient Dashboard Analytics
// @route   GET /api/patients/me/dashboard
// @access  Private (Patient only)
exports.getPatientDashboard = asyncHandler(async (req, res, next) => {
  const patientId = req.user.id;

  const upcomingAppointments = await Appointment.find({
    patientId,
    status: { $in: ['pending', 'confirmed', 'in-progress'] },
    date: { $gte: new Date().setHours(0, 0, 0, 0) },
  })
    .populate({ path: 'doctorId', select: 'name specialty profilePic consultationFee' })
    .sort({ date: 1, time: 1 });

  const pastAppointments = await Appointment.find({
    patientId,
    $or: [
      { status: { $in: ['completed', 'cancelled'] } },
      { date: { $lt: new Date().setHours(0, 0, 0, 0) } },
    ],
  })
    .populate({ path: 'doctorId', select: 'name specialty profilePic' })
    .sort({ date: -1, time: -1 });

  const prescriptions = await Prescription.find({ patientId })
    .populate({ path: 'doctorId', select: 'name specialty' })
    .sort({ createdAt: -1 });

  const medicalReports = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });

  const totalAppointments = await Appointment.countDocuments({ patientId });

  res.status(200).json({
    success: true,
    data: {
      upcomingAppointments,
      pastAppointments,
      prescriptions,
      medicalReports,
      totalAppointments,
    },
  });
});
