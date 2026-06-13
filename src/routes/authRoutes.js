const express = require('express');
const {
  register,
  login,
  getMe,
  updatePassword,
  uploadProfilePhoto,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { profileUpload } = require('../config/cloudinary');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/update-password', protect, updatePassword);
router.put('/profile-photo', protect, profileUpload.single('photo'), uploadProfilePhoto);

module.exports = router;

