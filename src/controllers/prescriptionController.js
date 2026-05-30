const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
exports.createPrescription = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized. Only doctors can write prescriptions', 403));
  }

  const { appointmentId, medications, instructions, notes } = req.body;

  // Validate appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }

  // Ensure this is the assigned doctor
  if (appointment.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized. You are not the assigned doctor for this appointment', 403));
  }

  const prescription = await Prescription.create({
    appointmentId,
    patientId: appointment.patientId,
    doctorId: req.user.id,
    medications,
    instructions,
    notes,
  });

  // Link prescription back to the appointment
  appointment.prescriptionId = prescription._id;
  await appointment.save();

  res.status(201).json({
    success: true,
    data: prescription,
  });
});

// @desc    Get prescription for a specific appointment
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private (Doctor, Patient, Admin)
exports.getPrescriptionByAppointment = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId })
    .populate({ path: 'doctorId', select: 'name specialty profilePic' })
    .populate({ path: 'patientId', select: 'name email profilePic' });

  if (!prescription) {
    return next(new ErrorResponse(`Prescription not found for appointment id of ${req.params.appointmentId}`, 404));
  }

  // Access check
  const isPatient = prescription.patientId._id.toString() === req.user.id;
  const isDoctor = prescription.doctorId._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isPatient && !isDoctor && !isAdmin) {
    return next(new ErrorResponse('Not authorized to view this prescription', 403));
  }

  res.status(200).json({
    success: true,
    data: prescription,
  });
});

// @desc    Get all prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPrescriptionsByPatient = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId;

  // Access check: patients can only see their own. Doctors/admins can see any patient's prescriptions.
  const isSelf = patientId === req.user.id;
  const isDoctorOrAdmin = ['doctor', 'admin'].includes(req.user.role);

  if (!isSelf && !isDoctorOrAdmin) {
    return next(new ErrorResponse('Not authorized to view these prescriptions', 403));
  }

  const prescriptions = await Prescription.find({ patientId })
    .populate({ path: 'doctorId', select: 'name specialty' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions,
  });
});
