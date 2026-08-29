const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const ComplaintTimelineLog = require('../models/ComplaintTimelineLog');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

const runSeederLogic = async (isStandalone = false) => {
  try {
    console.log('[Seeder] Ensuring demo accounts & departments exist...');
    const adminExists = await User.findOne({ email: 'admin@college.edu' });
    if (adminExists && !isStandalone) {
      console.log('[Seeder] Demo accounts already present in database.');
      return;
    }

    if (isStandalone) {
      console.log('[Seeder] Standalone mode: Clearing existing data...');
      await User.deleteMany({});
      await Department.deleteMany({});
      await Complaint.deleteMany({});
      await ComplaintTimelineLog.deleteMany({});
      await Feedback.deleteMany({});
      await Notification.deleteMany({});
    }

    const salt = await bcrypt.genSalt(12);
    const adminPass = await bcrypt.hash('AdminPass123!', salt);
    const studentPass = await bcrypt.hash('StudentPass123!', salt);
    const staffPass = await bcrypt.hash('StaffPass123!', salt);

    const admin = await User.create({
      name: 'Dr. Robert Vance (Chief Admin)',
      email: 'admin@college.edu',
      password: adminPass,
      role: 'admin',
      collegeId: 'ADM-001',
      phone: '+1 555-0192',
    });

    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'student@college.edu',
      password: studentPass,
      role: 'student',
      collegeId: 'STU-2024-042',
      phone: '+1 555-0143',
    });

    const student2 = await User.create({
      name: 'Sophia Patel',
      email: 'sophia@college.edu',
      password: studentPass,
      role: 'student',
      collegeId: 'STU-2024-108',
      phone: '+1 555-0177',
    });

    const staffIT = await User.create({
      name: 'Marcus Brody',
      email: 'staff.it@college.edu',
      password: staffPass,
      role: 'staff',
      collegeId: 'STF-IT-01',
      department: 'IT',
      phone: '+1 555-0188',
    });

    const staffMaint = await User.create({
      name: 'Sarah Connor',
      email: 'staff.maint@college.edu',
      password: staffPass,
      role: 'staff',
      collegeId: 'STF-MNT-02',
      department: 'MAINT',
      phone: '+1 555-0199',
    });

    const staffHostel = await User.create({
      name: 'David Miller',
      email: 'warden.hostel@college.edu',
      password: staffPass,
      role: 'staff',
      collegeId: 'STF-HST-03',
      department: 'HOSTEL',
      phone: '+1 555-0166',
    });

    const deptIT = await Department.create({
      name: 'IT & Network Support',
      code: 'IT',
      headId: staffIT._id,
      staffCount: 4,
      activeTicketsCount: 2,
    });

    const deptMaint = await Department.create({
      name: 'Campus Infrastructure & Maintenance',
      code: 'MAINT',
      headId: staffMaint._id,
      staffCount: 6,
      activeTicketsCount: 1,
    });

    const deptHostel = await Department.create({
      name: 'Hostel Operations & Services',
      code: 'HOSTEL',
      headId: staffHostel._id,
      staffCount: 5,
      activeTicketsCount: 1,
    });

    const deptClean = await Department.create({
      name: 'Housekeeping & Sanitation',
      code: 'CLEAN',
      headId: null,
      staffCount: 8,
      activeTicketsCount: 1,
    });

    const deptTrans = await Department.create({
      name: 'Campus Transport Services',
      code: 'TRANS',
      headId: null,
      staffCount: 3,
      activeTicketsCount: 0,
    });

    const comp1 = await Complaint.create({
      ticketId: 'CMP-2026-0001',
      studentId: student1._id,
      title: 'High-speed Wi-Fi down in Hostel Block B',
      description: 'The Wi-Fi router on the 3rd floor of Hostel Block B has been offline since yesterday evening. Students are unable to submit online assignments.',
      category: 'Wi-Fi',
      location: { block: 'Hostel Block B', floor: '3rd Floor', roomNumber: 'B-304', customDetails: 'Near north staircase' },
      priority: 'High',
      status: 'In Progress',
      assignedDepartment: deptIT._id,
      assignedStaff: staffIT._id,
      aiSummary: 'Wi-Fi router offline in Hostel Block B 3rd Floor disrupting student coursework.',
      aiCategoryConfidence: 0.96,
      isDuplicate: false,
    });

    await ComplaintTimelineLog.create({
      complaintId: comp1._id,
      actionBy: student1._id,
      previousStatus: '',
      newStatus: 'Submitted',
      comment: 'Complaint registered by student.',
    });

    await ComplaintTimelineLog.create({
      complaintId: comp1._id,
      actionBy: admin._id,
      previousStatus: 'Submitted',
      newStatus: 'Assigned',
      comment: 'Assigned ticket to IT & Network Support.',
    });

    await ComplaintTimelineLog.create({
      complaintId: comp1._id,
      actionBy: staffIT._id,
      previousStatus: 'Assigned',
      newStatus: 'In Progress',
      comment: 'Technician dispatched with replacement access point router.',
    });

    const comp2 = await Complaint.create({
      ticketId: 'CMP-2026-0002',
      studentId: student1._id,
      title: 'Leaking water pipe in Science Block washroom',
      description: 'Major water leakage from the sink pipe in 2nd floor male washroom, creating water logging on the floor.',
      category: 'Cleanliness',
      location: { block: 'Science Block A', floor: '2nd Floor', roomNumber: 'Restroom A-201', customDetails: '' },
      priority: 'Critical',
      status: 'Resolved',
      assignedDepartment: deptMaint._id,
      assignedStaff: staffMaint._id,
      aiSummary: 'Water leak from washroom sink causing water logging in Science Block.',
      aiCategoryConfidence: 0.94,
      isDuplicate: false,
      resolutionDetails: {
        summary: 'Replaced damaged PVC connector pipe and sanitized washroom floor.',
        resolvedAt: new Date(Date.now() - 3600000 * 4),
        resolvedBy: staffMaint._id,
      },
    });

    await ComplaintTimelineLog.create({
      complaintId: comp2._id,
      actionBy: student1._id,
      previousStatus: '',
      newStatus: 'Submitted',
      comment: 'Complaint registered.',
    });

    await ComplaintTimelineLog.create({
      complaintId: comp2._id,
      actionBy: staffMaint._id,
      previousStatus: 'In Progress',
      newStatus: 'Resolved',
      comment: 'Pipe connector replaced successfully.',
    });

    await Feedback.create({
      complaintId: comp2._id,
      studentId: student1._id,
      rating: 5,
      reviewComment: 'Prompt response! The maintenance team fixed it within 2 hours.',
    });

    console.log('[Seeder] Demo accounts and initial dataset seeded successfully!');
  } catch (error) {
    console.error('[Seeder] Seeding error:', error.message);
  }
};

if (require.main === module) {
  const { MONGO_URI } = require('../config/env');
  mongoose.connect(MONGO_URI).then(() => {
    runSeederLogic(true).then(() => process.exit(0));
  });
}

module.exports = { autoSeedIfEmpty: runSeederLogic };
