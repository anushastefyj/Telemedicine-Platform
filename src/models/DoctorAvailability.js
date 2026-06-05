const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String, // HH:MM
      required: true,
    },
    endTime: {
      type: String, // HH:MM
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    exceptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AvailabilityException',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Composite index to speed up availability lookup
doctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
