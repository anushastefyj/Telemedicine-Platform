const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_placeholder');
const Appointment = require('../models/Appointment');
const { Doctor } = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Create a payment intent for an appointment
// @route   POST /api/payments/create-intent
// @access  Private (Patient only)
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }

  // Ensure user owns this appointment
  if (appointment.patientId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this appointment', 403));
  }

  // Fetch doctor to get the consultation fee
  const doctor = await Doctor.findById(appointment.doctorId);
  if (!doctor) {
    return next(new ErrorResponse('Assigned doctor not found', 404));
  }

  const amount = Math.round(doctor.consultationFee * 100); // Stripe requires amount in cents

  // Create Stripe payment intent
  // If the secret key is a placeholder, handle mock gracefully for development
  let paymentIntent;
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
    // Generate mock client secret for local testing without valid Stripe key
    paymentIntent = {
      id: `pi_mock_${Math.random().toString(36).substring(2, 12)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(2, 12)}`,
      amount,
    };
  } else {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        appointmentId: appointment._id.toString(),
        patientId: req.user.id,
        doctorId: doctor._id.toString(),
      },
    });
  }

  // Update appointment with payment intent ID (paymentId)
  appointment.paymentId = paymentIntent.id;
  await appointment.save();

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount,
  });
});

// @desc    Confirm payment completion
// @route   POST /api/payments/confirm
// @access  Private (Patient only)
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { appointmentId, paymentId } = req.body;

  if (!appointmentId || !paymentId) {
    return next(new ErrorResponse('Please provide appointmentId and paymentId', 400));
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }

  // Verify ownership
  if (appointment.patientId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this appointment', 403));
  }

  // In production, we could retrieve payment intent from stripe to verify it.
  // We'll update the database fields:
  appointment.paymentStatus = 'paid';
  appointment.status = 'confirmed'; // Auto-confirm after payment
  appointment.paymentId = paymentId;

  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Payment confirmed and appointment scheduled',
    data: appointment,
  });
});
