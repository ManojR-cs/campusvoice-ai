const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  addComment,
  submitFeedback,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(upload.array('attachments', 5), createComplaint);

router.route('/:id')
  .get(getComplaintById)
  .delete(requireRole('admin'), deleteComplaint);

router.put('/:id/status', upload.single('proof'), updateStatus);
router.put('/:id/assign', requireRole('admin'), assignComplaint);
router.post('/:id/comments', addComment);
router.post('/:id/feedback', requireRole('student'), submitFeedback);

module.exports = router;
