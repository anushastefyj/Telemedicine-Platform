const { User, Doctor } = require('../models/User');
const Appointment = require('../models/Appointment');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    View all users (filter by role)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { role } = req.query;
  const filter = role ? { role } : {};

  const users = await User.find(filter).select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    View all doctors with stats
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
exports.getDoctorsList = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find({ role: 'doctor' }).select('-password');

  const doctorListWithStats = [];

  for (const doc of doctors) {
    const totalAppointments = await Appointment.countDocuments({ doctorId: doc._id });
    const completedAppointments = await Appointment.countDocuments({ doctorId: doc._id, status: 'completed' });
    const earnings = completedAppointments * (doc.consultationFee || 0);

    doctorListWithStats.push({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      specialty: doc.specialty,
      consultationFee: doc.consultationFee,
      rating: doc.rating || 0,
      totalReviews: doc.totalReviews || 0,
      stats: {
        totalAppointments,
        completedAppointments,
        earnings,
      },
    });
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctorListWithStats,
  });
});

// @desc    View all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
exports.getAppointmentsList = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find()
    .populate({ path: 'patientId', select: 'name email' })
    .populate({ path: 'doctorId', select: 'name specialty consultationFee' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    View total revenue & monthly breakdown
// @route   GET /api/admin/revenue
// @access  Private (Admin only)
exports.getRevenueStats = asyncHandler(async (req, res, next) => {
  // Aggregate paid appointments
  const paidAppointments = await Appointment.find({ paymentStatus: 'paid' }).populate('doctorId');

  const totalRevenue = paidAppointments.reduce((sum, app) => {
    const fee = app.doctorId && app.doctorId.consultationFee ? app.doctorId.consultationFee : 0;
    return sum + fee;
  }, 0);

  // Calculate monthly breakdown
  const monthlyRevenueMap = {};

  paidAppointments.forEach((app) => {
    const fee = app.doctorId && app.doctorId.consultationFee ? app.doctorId.consultationFee : 0;
    const dateObj = new Date(app.date);
    const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!monthlyRevenueMap[monthKey]) {
      monthlyRevenueMap[monthKey] = 0;
    }
    monthlyRevenueMap[monthKey] += fee;
  });

  const monthlyBreakdown = Object.keys(monthlyRevenueMap).map((month) => ({
    month,
    revenue: monthlyRevenueMap[month],
  })).sort((a, b) => b.month.localeCompare(a.month)); // Sort descending

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      monthlyBreakdown,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
