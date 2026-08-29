const Complaint = require('../models/Complaint');
const ComplaintTimelineLog = require('../models/ComplaintTimelineLog');
const Department = require('../models/Department');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const generateTicketId = require('../utils/ticketIdGenerator');
const { categorizeComplaint, summarizeComplaint, detectDuplicates } = require('./aiService');
const { emitComplaintUpdate, emitNewComplaintAlert } = require('../utils/socket');
const { sendNotificationEmail } = require('./emailService');

const createComplaint = async (studentId, complaintData, attachments = []) => {
  const ticketId = await generateTicketId();

  let { title, description, category, priority, location } = complaintData;

  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch (e) {
      location = { block: '', floor: '', roomNumber: '', customDetails: location };
    }
  }

  // AI categorizing if category is missing or default
  let aiCategoryConfidence = 0.85;
  if (!category || category === 'Other') {
    const aiRes = await categorizeComplaint(title, description);
    category = aiRes.category;
    aiCategoryConfidence = aiRes.confidence;
  }

  // AI summary
  const aiSummary = await summarizeComplaint(title, description);

  // Duplicate check
  const dupCheck = await detectDuplicates(title, description, category, location);

  const complaint = await Complaint.create({
    ticketId,
    studentId,
    title,
    description,
    category: category || 'Other',
    location: location || {},
    attachments: attachments.map((att) => ({ url: att.url, publicId: att.publicId || '' })),
    priority: priority || 'Medium',
    status: 'Submitted',
    aiSummary,
    aiCategoryConfidence,
    isDuplicate: dupCheck.isDuplicate,
    duplicateOfTicketId: dupCheck.duplicateOfTicketId,
  });

  // Create initial timeline log
  await ComplaintTimelineLog.create({
    complaintId: complaint._id,
    actionBy: studentId,
    previousStatus: '',
    newStatus: 'Submitted',
    comment: 'Complaint ticket created and submitted by student.',
  });

  // Real-time Socket alert to Admin
  emitNewComplaintAlert({
    ticketId: complaint.ticketId,
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    createdAt: complaint.createdAt,
  });

  return complaint;
};

const getComplaints = async (user, filters = {}) => {
  const query = {};

  if (user.role === 'student') {
    query.studentId = user._id;
  } else if (user.role === 'staff') {
    // Staff sees assigned complaints or complaints in their department
    if (user.department) {
      const dept = await Department.findOne({ code: user.department });
      if (dept) {
        query.$or = [{ assignedStaff: user._id }, { assignedDepartment: dept._id }];
      } else {
        query.assignedStaff = user._id;
      }
    } else {
      query.assignedStaff = user._id;
    }
  }

  if (filters.status && filters.status !== 'All') {
    query.status = filters.status;
  }

  if (filters.category && filters.category !== 'All') {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { ticketId: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const complaints = await Complaint.find(query)
    .populate('studentId', 'name email collegeId phone')
    .populate('assignedDepartment', 'name code')
    .populate('assignedStaff', 'name email department')
    .sort({ createdAt: -1 });

  return complaints;
};

const getComplaintById = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId)
    .populate('studentId', 'name email collegeId phone')
    .populate('assignedDepartment', 'name code headId')
    .populate('assignedStaff', 'name email department phone');

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  const timelineLogs = await ComplaintTimelineLog.find({ complaintId: complaint._id })
    .populate('actionBy', 'name role email')
    .sort({ createdAt: 1 });

  const feedback = await Feedback.findOne({ complaintId: complaint._id }).populate('studentId', 'name');

  return { complaint, timelineLogs, feedback };
};

const updateComplaintStatus = async (complaintId, user, { status, comment, resolutionSummary, proofAttachment }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new Error('Complaint ticket not found');
  }

  const previousStatus = complaint.status;
  complaint.status = status;

  if (status === 'Resolved') {
    complaint.resolutionDetails = {
      summary: resolutionSummary || comment || 'Issue has been successfully resolved.',
      resolvedAt: new Date(),
      resolvedBy: user._id,
      proofAttachment: proofAttachment || '',
    };
  }

  await complaint.save();

  // Create timeline audit log
  await ComplaintTimelineLog.create({
    complaintId: complaint._id,
    actionBy: user._id,
    previousStatus,
    newStatus: status,
    comment: comment || `Status updated to ${status}`,
  });

  // Create Notification for Student
  await Notification.create({
    userId: complaint.studentId,
    title: `Ticket ${complaint.ticketId} Updated`,
    message: `Your complaint status has changed from ${previousStatus} to ${status}.`,
    link: `/student/complaints/${complaint._id}`,
  });

  // Emit Socket.IO update
  emitComplaintUpdate(complaint._id.toString(), {
    ticketId: complaint.ticketId,
    status,
    previousStatus,
    comment,
    updatedAt: complaint.updatedAt,
  });

  return complaint;
};

const assignDepartmentAndStaff = async (complaintId, adminUser, { departmentId, staffId }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  const previousStatus = complaint.status;
  complaint.assignedDepartment = departmentId;
  if (staffId) {
    complaint.assignedStaff = staffId;
  }
  complaint.status = 'Assigned';
  await complaint.save();

  // Update department ticket count
  if (departmentId) {
    await Department.findByIdAndUpdate(departmentId, { $inc: { activeTicketsCount: 1 } });
  }

  // Create timeline log
  await ComplaintTimelineLog.create({
    complaintId: complaint._id,
    actionBy: adminUser._id,
    previousStatus,
    newStatus: 'Assigned',
    comment: `Assigned complaint to department by administrator.`,
  });

  // Notify student
  await Notification.create({
    userId: complaint.studentId,
    title: `Ticket ${complaint.ticketId} Assigned`,
    message: `Your complaint has been assigned to department for action.`,
    link: `/student/complaints/${complaint._id}`,
  });

  emitComplaintUpdate(complaint._id.toString(), {
    ticketId: complaint.ticketId,
    status: 'Assigned',
    assignedDepartment: departmentId,
  });

  return complaint;
};

const submitFeedback = async (complaintId, studentId, { rating, reviewComment }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  if (complaint.studentId.toString() !== studentId.toString()) {
    throw new Error('Only the student who submitted this ticket can submit feedback');
  }

  let feedback = await Feedback.findOne({ complaintId: complaint._id });
  if (feedback) {
    feedback.rating = rating;
    feedback.reviewComment = reviewComment;
    await feedback.save();
  } else {
    feedback = await Feedback.create({
      complaintId: complaint._id,
      studentId,
      rating,
      reviewComment,
    });
  }

  // Auto-close ticket on feedback
  complaint.status = 'Closed';
  await complaint.save();

  await ComplaintTimelineLog.create({
    complaintId: complaint._id,
    actionBy: studentId,
    previousStatus: 'Resolved',
    newStatus: 'Closed',
    comment: `Student submitted ${rating}-star feedback and closed the ticket.`,
  });

  emitComplaintUpdate(complaint._id.toString(), {
    ticketId: complaint.ticketId,
    status: 'Closed',
  });

  return feedback;
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignDepartmentAndStaff,
  submitFeedback,
};
