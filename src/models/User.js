const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const options = {
  discriminatorKey: 'role', // role field will distinguish doctors, patients, and admins
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please add a valid email',
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  options
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Doctor Discriminator Schema (extends User)
const doctorSchema = new mongoose.Schema({
  specialty: {
    type: String,
    required: [true, 'Please specify doctor specialty'],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, 'Please specify experience in years'],
    min: [0, 'Experience cannot be negative'],
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please specify consultation fee'],
    min: [0, 'Consultation fee cannot be negative'],
  },
  schedule: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      startTime: {
        type: String, // HH:MM format
        required: true,
      },
      endTime: {
        type: String, // HH:MM format
        required: true,
      },
    },
  ],
  availability: [
    {
      type: Date, // list of dates doctor is available or custom slot dates
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true,
    trim: true,
  },
});

// Patient Discriminator Schema (extends User)
const patientSchema = new mongoose.Schema({
  medicalHistory: [
    {
      type: String,
    },
  ],
  allergies: [
    {
      type: String,
    },
  ],
  insuranceInfo: {
    provider: {
      type: String,
      default: '',
    },
    policyNumber: {
      type: String,
      default: '',
    },
    groupNumber: {
      type: String,
      default: '',
    },
  },
});

const Doctor = User.discriminator('doctor', doctorSchema);
const Patient = User.discriminator('patient', patientSchema);

module.exports = {
  User,
  Doctor,
  Patient,
};
