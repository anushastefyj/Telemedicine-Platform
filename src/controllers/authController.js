const jwt = require('jsonwebtoken');
const { User, Doctor, Patient } = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send response helper
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, address, profilePic } = req.body;

  // Check if role is admin
  if (role === 'admin') {
    return next(new ErrorResponse('Direct registration for Admin is not allowed', 400));
  }

  // Base fields
  const userData = {
    name,
    email,
    password,
    role,
    phone,
    address,
    profilePic,
  };

  let user;

  if (role === 'doctor') {
    const { specialty, experience, consultationFee, licenseNumber, schedule, availability } = req.body;
    user = await Doctor.create({
      ...userData,
      specialty,
      experience,
      consultationFee,
      licenseNumber,
      schedule: schedule || [],
      availability: availability || [],
    });
  } else if (role === 'patient') {
    const { medicalHistory, allergies, insuranceInfo } = req.body;
    user = await Patient.create({
      ...userData,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      insuranceInfo: insuranceInfo || {},
    });
  } else {
    // If role is omitted, default to patient
    user = await Patient.create({
      ...userData,
      role: 'patient',
    });
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   POST /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new passwords', 400));
  }

  // Find user (we need the password field explicitly)
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Incorrect current password', 401));
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
