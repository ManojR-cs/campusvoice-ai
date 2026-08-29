const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, getStaffMembers } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(requireRole('admin'), createDepartment);

router.get('/staff', requireRole('admin'), getStaffMembers);

module.exports = router;
