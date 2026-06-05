const express = require('express');
const router = express.Router();
const {
  uploadRecord,
  getPatientRecords,
  getRecordById,
  deleteRecord,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.post('/upload', upload.single('file'), uploadRecord);
router.get('/patient/:patientId', getPatientRecords);
router.get('/:id', getRecordById);
router.delete('/:id', authorize('doctor', 'admin'), deleteRecord);

module.exports = router;
