const express = require('express');
const router = express.Router();
const { createRoom, getRoom, deleteRoom } = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/create-room', authorize('doctor'), createRoom);
router.get('/room/:appointmentId', getRoom);
router.delete('/room/:id', authorize('doctor', 'admin'), deleteRoom);

module.exports = router;
