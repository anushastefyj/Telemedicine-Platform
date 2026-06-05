const mongoose = require('mongoose');

const availabilityExceptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date, // YYYY-MM-DD format (time set to 00:00:00)
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique exception per doctor per date
availabilityExceptionSchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AvailabilityException', availabilityExceptionSchema);
