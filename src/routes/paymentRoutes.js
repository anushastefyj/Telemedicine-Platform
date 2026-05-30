const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Payment routes require authentication

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

module.exports = router;
