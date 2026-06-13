const express = require('express');
const {
  getMessages,
  sendMessage,
  markAsRead,
  getContacts
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All message routes require authentication

router.get('/contacts', getContacts);
router.route('/:userId')
  .get(getMessages)
  .post(sendMessage);

router.put('/:userId/read', markAsRead);

module.exports = router;
