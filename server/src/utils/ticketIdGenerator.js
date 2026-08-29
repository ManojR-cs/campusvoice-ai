const Complaint = require('../models/Complaint');

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `CMP-${year}-${sequence}`;
};

module.exports = generateTicketId;
