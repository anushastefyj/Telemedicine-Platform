const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
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
    medications: [
      {
        name: {
          type: String,
          required: [true, 'Medication name is required'],
        },
        dosage: {
          type: String,
          required: [true, 'Dosage is required'], // e.g. "500mg" or "1 tablet"
        },
        frequency: {
          type: String,
          required: [true, 'Frequency is required'], // e.g. "twice a day" or "every 8 hours"
        },
        duration: {
          type: String,
          required: [true, 'Duration is required'], // e.g. "7 days" or "1 month"
        },
        daysTaken: {
          type: Number,
          default: 0,
        },
      },
    ],
    instructions: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
