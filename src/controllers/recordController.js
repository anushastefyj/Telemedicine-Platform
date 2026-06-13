const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Upload a new medical record
// @route   POST /api/records/upload
// @access  Private
exports.uploadRecord = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const { appointmentId, description } = req.body;

  if (!appointmentId) {
    return next(new ErrorResponse('Appointment ID is required', 400));
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  // Authorization: Only doctor or patient of this appointment can upload records
  const isPatient = appointment.patientId.toString() === req.user.id;
  const isDoctor = appointment.doctorId.toString() === req.user.id;

  if (!isPatient && !isDoctor && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to upload records for this appointment', 403));
  }

  // Determine fileType
  const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

  const record = await MedicalRecord.create({
    patientId: appointment.patientId,
    appointmentId,
    fileUrl: req.file.path, // Cloudinary url
    fileType,
    fileName: req.file.originalname || 'uploaded_document',
    description,
  });

  res.status(201).json({
    success: true,
    data: record,
  });
});

// @desc    Create a form-based medical report (no file upload)
// @route   POST /api/records
// @access  Private (Doctor only)
exports.createReportRecord = asyncHandler(async (req, res, next) => {
  const { appointmentId, patientId, symptoms, diagnosis, treatmentPlan, notes } = req.body;

  if (!appointmentId || !patientId) {
    return next(new ErrorResponse('Appointment ID and Patient ID are required', 400));
  }

  // Authorization: Only doctor can create report
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Only doctors can create medical reports', 403));
  }

  const record = await MedicalRecord.create({
    patientId,
    appointmentId,
    symptoms,
    diagnosis,
    treatmentPlan,
    notes,
  });

  // Emit real-time notification to the patient using the function stored in app.locals
  if (req.app.locals.sendRealTimeNotification) {
    req.app.locals.sendRealTimeNotification(patientId, 'receive-medical-record', record);
  }

  res.status(201).json({
    success: true,
    data: record,
  });
});

// @desc    Get all records for a patient
// @route   GET /api/records/patient/:patientId
// @access  Private
exports.getPatientRecords = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params;

  // Authorization check
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.id === patientId;
  let isAuthorizedDoctor = false;

  if (req.user.role === 'doctor') {
    const appointment = await Appointment.findOne({
      doctorId: req.user.id,
      patientId: patientId,
    });
    if (appointment) {
      isAuthorizedDoctor = true;
    }
  }

  if (!isAdmin && !isSelf && !isAuthorizedDoctor) {
    return next(new ErrorResponse('Not authorized to access these medical records', 403));
  }

  const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

// @desc    Get single record details
// @route   GET /api/records/:id
// @access  Private
exports.getRecordById = asyncHandler(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    return next(new ErrorResponse(`Medical record not found with id of ${req.params.id}`, 404));
  }

  // Authorization check
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.id === record.patientId.toString();
  let isAuthorizedDoctor = false;

  if (req.user.role === 'doctor') {
    const appointment = await Appointment.findOne({
      doctorId: req.user.id,
      patientId: record.patientId,
    });
    if (appointment) {
      isAuthorizedDoctor = true;
    }
  }

  if (!isAdmin && !isSelf && !isAuthorizedDoctor) {
    return next(new ErrorResponse('Not authorized to access this medical record', 403));
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private (Doctor/Admin only)
exports.deleteRecord = asyncHandler(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    return next(new ErrorResponse(`Medical record not found with id of ${req.params.id}`, 404));
  }

  // Authorization: Only Doctor or Admin can delete records
  const isDoctor = req.user.role === 'doctor';
  const isAdmin = req.user.role === 'admin';

  if (!isDoctor && !isAdmin) {
    return next(new ErrorResponse('Only Doctors and Admins are authorized to delete medical records', 403));
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Medical record deleted successfully',
  });
});
