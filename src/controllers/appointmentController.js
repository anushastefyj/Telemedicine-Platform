const Appointment = require('../models/Appointment');
const { Doctor, Patient } = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/error');
const { sendBookingConfirmation, sendAppointmentReminder } = require('../services/emailService');

// Helper to generate a simple video room ID
const generateVideoCallId = () => {
  return `room-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString().slice(-4)}`;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient/Admin)
exports.bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, date, time, duration, reason, symptoms } = req.body;

  // Validate doctor exists
  const doctor = await Doctor.findOne({ _id: doctorId, role: 'doctor' });
  if (!doctor) {
    return next(new ErrorResponse(`Doctor not found with id of ${doctorId}`, 404));
  }

  // Create video call room ID automatically
  const videoCallId = generateVideoCallId();

  const appointment = await Appointment.create({
    patientId: req.user.id,
    doctorId,
    date,
    time,
    duration,
    reason,
    symptoms,
    videoCallId,
    paymentStatus: 'pending',
    status: 'pending',
  });

  // Send Booking Confirmation Email asynchronously
  try {
    const patientUser = await Patient.findById(req.user.id);
    if (patientUser) {
      sendBookingConfirmation(appointment, patientUser, doctor);
      
      // Simulate/trigger a 1-hour reminder email in a real scenario (or scheduled task).
      // For testing/mocking flow, we can schedule a reminder check or log it.
      setTimeout(async () => {
        try {
          console.log(`Sending 1-hour appointment reminder for appointment ${appointment._id}`);
          await sendAppointmentReminder(appointment, patientUser, doctor);
        } catch (reminderErr) {
          console.error('Error sending scheduled reminder:', reminderErr);
        }
      }, 5000); // Trigger 5 seconds later in development so it can be verified easily!
    }
  } catch (emailErr) {
    console.error('Failed to trigger confirmation email:', emailErr);
  }

  res.status(201).json({
    success: true,
    data: appointment,
  });
});

// @desc    Get logged in user's appointments (Patient or Doctor)
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = asyncHandler(async (req, res, next) => {
  let query = {};

  if (req.user.role === 'patient') {
    query = { patientId: req.user.id };
  } else if (req.user.role === 'doctor') {
    query = { doctorId: req.user.id };
  } else if (req.user.role === 'admin') {
    query = {}; // Admin can see all
  } else {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const appointments = await Appointment.find(query)
    .populate({ path: 'patientId', select: 'name email phone profilePic' })
    .populate({ path: 'doctorId', select: 'name specialty consultationFee profilePic' })
    .sort({ date: -1, time: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'patientId', select: 'name email phone profilePic medicalHistory allergies' })
    .populate({ path: 'doctorId', select: 'name specialty consultationFee profilePic schedule' });

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Access check: only patient, doctor, or admin can view
  const isPatient = appointment.patientId._id.toString() === req.user.id;
  const isDoctor = appointment.doctorId._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new ErrorResponse('Not authorized to view this appointment', 403));
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Access check: only patient, doctor, or admin can cancel
  const isPatient = appointment.patientId.toString() === req.user.id;
  const isDoctor = appointment.doctorId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: appointment,
  });
});

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Doctor only)
exports.confirmAppointment = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized. Only doctors can confirm appointments', 403));
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Ensure this is the doctor assigned to the appointment
  if (appointment.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized. You are not the assigned doctor', 403));
  }

  appointment.status = 'confirmed';
  await appointment.save();

  // Send real-time socket notification to patient
  try {
    const { sendRealTimeNotification } = require('../server');
    sendRealTimeNotification(appointment.patientId.toString(), 'appointment-confirmed', {
      appointmentId: appointment._id,
      message: `Your appointment with Dr. ${req.user.name} has been confirmed.`,
    });
  } catch (socketErr) {
    console.error('Failed to send real-time confirmation socket notification:', socketErr);
  }

  res.status(200).json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: appointment,
  });
});

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
exports.completeAppointment = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized. Only doctors can complete appointments', 403));
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  // Ensure this is the doctor assigned to the appointment
  if (appointment.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized. You are not the assigned doctor', 403));
  }

  appointment.status = 'completed';
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment completed successfully',
    data: appointment,
  });
});
