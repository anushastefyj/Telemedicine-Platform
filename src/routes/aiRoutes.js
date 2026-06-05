const express = require('express');
const router = express.Router();
const { analyzeSymptoms, summarizePrescription } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/symptoms', analyzeSymptoms);
router.post('/prescription-summary', summarizePrescription);

module.exports = router;
