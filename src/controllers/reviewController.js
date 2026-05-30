const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Add review for a doctor after completed appointment
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.addReview = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'patient') {
    return next(new ErrorResponse('Not authorized. Only patients can write reviews', 403));
  }

  const { appointmentId, rating, comment } = req.body;

  // Find appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }

  // Check ownership
  if (appointment.patientId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized. You are not the patient for this appointment', 403));
  }

  // Ensure appointment is completed
  if (appointment.status !== 'completed') {
    return next(new ErrorResponse('You can only review a doctor after the appointment has been completed', 400));
  }

  // Create review
  const review = await Review.create({
    appointmentId,
    patientId: req.user.id,
    doctorId: appointment.doctorId,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Get all reviews for a specific doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getReviewsByDoctor = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ doctorId: req.params.doctorId })
    .populate({ path: 'patientId', select: 'name profilePic' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});
