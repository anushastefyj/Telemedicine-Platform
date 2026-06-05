const VideoRoom = require('../models/VideoRoom');
const Appointment = require('../models/Appointment');
const { ErrorResponse } = require('../middleware/error');
const crypto = require('crypto');

// @desc    Create video room for an appointment
// @route   POST /api/video/create-room
// @access  Private (Doctor only)
exports.createRoom = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return next(new ErrorResponse('Appointment ID is required', 400));
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Check if the current user is the doctor of this appointment
    if (appointment.doctorId.toString() !== req.user.id) {
      return next(new ErrorResponse('Only the assigned doctor can create the video room', 403));
    }

    // Generate a unique room name/URL
    const roomUrl = `https://meet.jit.si/CareSync-${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // Expires in 2 hours

    let room = await VideoRoom.findOne({ appointmentId });

    if (room) {
      room.roomUrl = roomUrl;
      room.expiresAt = expiresAt;
      await room.save();
    } else {
      room = await VideoRoom.create({
        appointmentId,
        roomUrl,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        expiresAt,
      });
    }

    // Update appointment videoCallId
    appointment.videoCallId = room._id.toString();
    await appointment.save();

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get video room details
// @route   GET /api/video/room/:appointmentId
// @access  Private (Patient/Doctor only)
exports.getRoom = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Authorization: Must be doctor or patient for the appointment
    const isPatient = appointment.patientId.toString() === req.user.id;
    const isDoctor = appointment.doctorId.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return next(new ErrorResponse('Not authorized to access this video room', 403));
    }

    // Validate scheduled time slot
    const appointmentTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffInMinutes = (now - appointmentTime) / (1000 * 60);
    const duration = appointment.duration || 30;

    // Allow joining within -15 minutes to duration + 15 minutes window
    if (diffInMinutes < -15 || diffInMinutes > duration + 15) {
      return next(
        new ErrorResponse(
          'Consultation room is only accessible at the scheduled appointment time',
          403
        )
      );
    }

    const room = await VideoRoom.findOne({ appointmentId });
    if (!room) {
      return next(new ErrorResponse('Video room has not been created yet by the doctor', 404));
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    End video consultation (End call)
// @route   DELETE /api/video/room/:id
// @access  Private (Doctor only)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await VideoRoom.findById(req.params.id);

    if (!room) {
      return next(new ErrorResponse('Video room not found', 404));
    }

    // Check authorization: Only doctor assigned to this room can delete it
    if (room.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to end this call', 403));
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video room ended successfully',
    });
  } catch (err) {
    next(err);
  }
};
