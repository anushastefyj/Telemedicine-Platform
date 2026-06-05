const express = require('express');
const router = express.Router();
const { sendUpcomingReminders, getReminderHistory } = require('../controllers/reminderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/send-upcoming', authorize('admin'), sendUpcomingReminders);
router.get('/history', getReminderHistory);

module.exports = router;
