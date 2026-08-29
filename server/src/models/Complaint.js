const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Classroom', 'Laboratory', 'Hostel', 'Wi-Fi', 'Infrastructure', 'Transportation', 'Cleanliness', 'Other'],
      default: 'Other',
    },
    location: {
      block: { type: String, default: '' },
      floor: { type: String, default: '' },
      roomNumber: { type: String, default: '' },
      customDetails: { type: String, default: '' },
    },
    attachments: [
      {
        url: { type: String },
        publicId: { type: String, default: '' },
      },
    ],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Submitted',
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    aiCategoryConfidence: {
      type: Number,
      default: 0.85,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOfTicketId: {
      type: String,
      default: '',
    },
    resolutionDetails: {
      summary: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      proofAttachment: { type: String, default: '' },
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
