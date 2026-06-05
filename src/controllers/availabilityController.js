const DoctorAvailability = require('../models/DoctorAvailability');
const AvailabilityException = require('../models/AvailabilityException');
const Appointment = require('../models/Appointment');
const { Doctor } = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

// @desc    Update weekly availability and exceptions
// @route   PUT /api/doctors/me/availability
// @access  Private (Doctor only)
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const { availability, exceptions } = req.body;

  // Clear existing weekly availability
  await DoctorAvailability.deleteMany({ doctorId: req.user.id });

  const savedAvailability = [];
  if (availability && Array.isArray(availability)) {
    for (const item of availability) {
      const av = await DoctorAvailability.create({
        doctorId: req.user.id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      });
      savedAvailability.push(av);
    }
  }

  // Handle exceptions
  if (exceptions && Array.isArray(exceptions)) {
    for (const ex of exceptions) {
      const targetDate = new Date(ex.date);
      targetDate.setHours(0, 0, 0, 0);

      const savedEx = await AvailabilityException.findOneAndUpdate(
        { doctorId: req.user.id, date: targetDate },
        { isBlocked: ex.isBlocked },
        { upsert: true, new: true }
      );

      // Link exception back to availability
      await DoctorAvailability.updateMany(
        { doctorId: req.user.id },
        { $addToSet: { exceptions: savedEx._id } }
      );
    }
  }

  res.status(200).json({
    success: true,
    data: savedAvailability,
  });
});

// @desc    Get doctor weekly availability schedule
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = asyncHandler(async (req, res, next) => {
  const weekly = await DoctorAvailability.find({ doctorId: req.params.id }).populate('exceptions');
  const exceptions = await AvailabilityException.find({ doctorId: req.params.id });

  res.status(200).json({
    success: true,
    data: {
      weekly,
      exceptions,
    },
  });
});

// @desc    Get doctor available slots for a specific date
// @route   GET /api/doctors/:id/available-slots
// @access  Public
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse('Please provide a date query parameter (YYYY-MM-DD)', 400));
  }

  const queryDate = new Date(date);
  if (isNaN(queryDate.getTime())) {
    return next(new ErrorResponse('Invalid date format', 400));
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Check if date is blocked in exceptions
  const exception = await AvailabilityException.findOne({
    doctorId: req.params.id,
    date: targetDate,
  });

  if (exception && exception.isBlocked) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[queryDate.getDay()];

  // Fetch weekly availability for this day
  const availabilities = await DoctorAvailability.find({
    doctorId: req.params.id,
    dayOfWeek: dayName,
    isAvailable: true,
  });

  if (!availabilities || availabilities.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
    });
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
  const slots = [];

  for (const av of availabilities) {
    const [startHour, startMin] = av.startTime.split(':').map(Number);
    const [endHour, endMin] = av.endTime.split(':').map(Number);

    let currentMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    while (currentMin + 30 <= endTotalMin) {
      const hh = Math.floor(currentMin / 60).toString().padStart(2, '0');
      const mm = (currentMin % 60).toString().padStart(2, '0');
      const timeStr = `${hh}:${mm}`;

      slots.push({
        startTime: timeStr,
        endTime: (() => {
          const nextMin = currentMin + 30;
          const nextHh = Math.floor(nextMin / 60).toString().padStart(2, '0');
          const nextMm = (nextMin % 60).toString().padStart(2, '0');
          return `${nextHh}:${nextMm}`;
        })(),
      });

      currentMin += 30;
    }
  }

  // Filter out booked slots
  const availableSlots = slots.filter((slot) => !bookedTimes.includes(slot.startTime));

  res.status(200).json({
    success: true,
    data: availableSlots,
  });
});
