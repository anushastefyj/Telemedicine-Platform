const { scanAndSendReminders } = require('../services/reminderCron');
const Reminder = require('../models/Reminder');
const { asyncHandler, ErrorResponse } = require('../middleware/error');

// @desc    Manually trigger sending of upcoming appointment reminders
// @route   POST /api/reminders/send-upcoming
// @access  Private (Admin only)
exports.sendUpcomingReminders = asyncHandler(async (req, res, next) => {
  const result = await scanAndSendReminders();
  res.status(200).json({
    success: true,
    message: 'Reminder check triggered successfully',
    data: result,
  });
});

// @desc    Get reminder history for an appointment
// @route   GET /api/reminders/history
// @access  Private (Doctor/Admin/Patient)
exports.getReminderHistory = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.query;

  if (!appointmentId) {
    return next(new ErrorResponse('Please provide appointmentId query parameter', 400));
  }

  const history = await Reminder.find({ appointmentId }).sort({ sentAt: -1 });

  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});
