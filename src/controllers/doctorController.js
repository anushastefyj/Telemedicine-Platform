const { Doctor } = require('../models/User');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Get all doctors with filtering
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const { specialty, rating, maxFee } = req.query;
  const query = { role: 'doctor' };

  if (specialty) {
    query.specialty = { $regex: specialty, $options: 'i' };
  }

  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  if (maxFee) {
    query.consultationFee = { $lte: parseFloat(maxFee) };
  }

  const doctors = await Doctor.find(query);

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc    Get single doctor with reviews
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, role: 'doctor' });

  if (!doctor) {
    return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
  }

  // Retrieve reviews for this doctor
  const reviews = await Review.find({ doctorId: req.params.id })
    .populate({ path: 'patientId', select: 'name profilePic' });

  res.status(200).json({
    success: true,
    data: {
      doctor,
      reviews,
    },
  });
});

// @desc    Get current doctor profile
// @route   GET /api/doctors/me
// @access  Private (Doctor only)
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const doctor = await Doctor.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/me
// @access  Private (Doctor only)
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  // Only allow updating doctor-specific fields or base profile fields
  const fieldsToUpdate = [
    'name',
    'phone',
    'address',
    'profilePic',
    'specialty',
    'experience',
    'consultationFee',
    'schedule',
    'availability',
    'licenseNumber',
  ];

  const updateData = {};
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// @desc    Get current doctor's appointments
// @route   GET /api/doctors/me/appointments
// @access  Private (Doctor only)
exports.getMyAppointments = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const appointments = await Appointment.find({ doctorId: req.user.id })
    .populate({ path: 'patientId', select: 'name email phone profilePic medicalHistory allergies' })
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});
