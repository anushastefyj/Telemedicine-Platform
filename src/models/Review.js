const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true, // A patient can only review once per appointment
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating must be between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get average rating and total reviews for a doctor
reviewSchema.statics.getAverageRating = async function (doctorId) {
  const obj = await this.aggregate([
    {
      $match: { doctorId },
    },
    {
      $group: {
        _id: '$doctorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('User').findByIdAndUpdate(doctorId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews,
      });
    } else {
      await mongoose.model('User').findByIdAndUpdate(doctorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.doctorId);
});

// Call getAverageRating before remove (if deleted)
reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.doctorId);
});

module.exports = mongoose.model('Review', reviewSchema);
