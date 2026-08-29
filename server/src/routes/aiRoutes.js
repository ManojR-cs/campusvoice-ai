const express = require('express');
const router = express.Router();
const { autoCategorize, summarize, checkDuplicates } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/categorize', autoCategorize);
router.post('/summarize', summarize);
router.post('/detect-duplicates', checkDuplicates);

module.exports = router;
