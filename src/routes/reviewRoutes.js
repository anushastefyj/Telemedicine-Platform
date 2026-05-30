const express = require('express');
const {
  addReview,
  getReviewsByDoctor,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Add review requires authentication
router.post('/', protect, addReview);

// Public route to view doctor ratings/reviews
router.get('/doctor/:doctorId', getReviewsByDoctor);

module.exports = router;
