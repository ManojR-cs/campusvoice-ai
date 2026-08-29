const complaintService = require('../services/complaintService');
const Complaint = require('../models/Complaint');
const ComplaintTimelineLog = require('../models/ComplaintTimelineLog');

const createComplaint = async (req, res, next) => {
  try {
    const attachments = req.files
      ? req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
        }))
      : [];

    const complaint = await complaintService.createComplaint(req.user._id, req.body, attachments);
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getComplaints(req.user, req.query);
    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const data = await complaintService.getComplaintById(req.params.id);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, comment, resolutionSummary } = req.body;
    const proofAttachment = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = await complaintService.updateComplaintStatus(req.params.id, req.user, {
      status,
      comment,
      resolutionSummary,
      proofAttachment,
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      complaint,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, staffId } = req.body;
    const complaint = await complaintService.assignDepartmentAndStaff(req.params.id, req.user, {
      departmentId,
      staffId,
    });
    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    const log = await ComplaintTimelineLog.create({
      complaintId: complaint._id,
      actionBy: req.user._id,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      comment: comment || 'Clarification posted',
    });

    res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { rating, reviewComment } = req.body;
    const feedback = await complaintService.submitFeedback(req.params.id, req.user._id, {
      rating,
      reviewComment,
    });
    res.status(200).json({
      success: true,
      message: 'Feedback submitted and ticket closed',
      feedback,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    res.status(200).json({
      success: true,
      message: 'Complaint ticket deleted by admin',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  addComment,
  submitFeedback,
  deleteComplaint,
};
