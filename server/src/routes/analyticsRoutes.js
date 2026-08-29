const express = require('express');
const router = express.Router();
const { getOverview, getDepartmentPerformance } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRole('admin'));

router.get('/overview', getOverview);
router.get('/department-wise', getDepartmentPerformance);

module.exports = router;
