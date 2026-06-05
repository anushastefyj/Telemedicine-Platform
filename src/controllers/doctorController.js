const { Doctor } = require('../models/User');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Availability = require('../models/Availability');
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

// @desc    Update doctor availability
// @route   PUT /api/doctors/me/availability
// @access  Private (Doctor only)
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const { weeklySchedule, vacationMode, customSlots } = req.body;

  let availability = await Availability.findOne({ doctorId: req.user.id });

  if (!availability) {
    availability = new Availability({
      doctorId: req.user.id,
      weeklySchedule,
      vacationMode,
      customSlots,
    });
  } else {
    if (weeklySchedule !== undefined) availability.weeklySchedule = weeklySchedule;
    if (vacationMode !== undefined) availability.vacationMode = vacationMode;
    if (customSlots !== undefined) availability.customSlots = customSlots;
  }

  await availability.save();

  res.status(200).json({
    success: true,
    data: availability,
  });
});

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/doctors/:id/available-slots
// @access  Public
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse('Please provide a date query parameter (YYYY-MM-DD)', 400));
  }

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
  }

  const queryDate = new Date(date);
  if (isNaN(queryDate.getTime())) {
    return next(new ErrorResponse('Invalid date format', 400));
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[queryDate.getDay()];

  // Check vacation mode first
  const availability = await Availability.findOne({ doctorId: req.params.id });
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (availability && availability.vacationMode && availability.vacationMode.enabled) {
    const start = new Date(availability.vacationMode.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(availability.vacationMode.endDate);
    end.setHours(23, 59, 59, 999);

    if (targetDate >= start && targetDate <= end) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
  }

  // Get booked appointments on this day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctorId: req.params.id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed', 'in-progress'] },
  });

  const bookedTimes = appointments.map((app) => app.time);

  let slots = [];

  // Check Availability document
  if (availability) {
    // Check if custom slots exist for this date
    const customDay = availability.customSlots.find(
      (c) => new Date(c.date).toDateString() === targetDate.toDateString()
    );

    if (customDay) {
      slots = customDay.slots;
    } else {
      // Find weekly schedule
      const daySchedule = availability.weeklySchedule.find((w) => w.day === dayName);
      if (daySchedule) {
        slots = daySchedule.slots;
      }
    }
  }

  // Fallback to doctor's base schedule if no custom/weekly availability doc is found
  if (slots.length === 0 && doctor.schedule && doctor.schedule.length > 0) {
    const daySchedule = doctor.schedule.find((s) => s.day === dayName);
    if (daySchedule) {
      // Generate 30 mins slots between daySchedule.startTime and daySchedule.endTime
      const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
      const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

      let currentMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      while (currentMin + 30 <= endTotalMin) {
        const hh = Math.floor(currentMin / 60).toString().padStart(2, '0');
        const mm = (currentMin % 60).toString().padStart(2, '0');
        const nextHh = Math.floor((currentMin + 30) / 60).toString().padStart(2, '0');
        const nextMm = ((currentMin + 30) % 60).toString().padStart(2, '0');

        slots.push({
          startTime: `${hh}:${mm}`,
          endTime: `${nextHh}:${nextMm}`,
        });

        currentMin += 30;
      }
    }
  }

  // Filter out booked slots
  const availableSlots = slots.filter((slot) => !bookedTimes.includes(slot.startTime));

  res.status(200).json({
    success: true,
    data: availableSlots,
  });
});
