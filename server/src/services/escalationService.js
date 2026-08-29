const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const ComplaintTimelineLog = require('../models/ComplaintTimelineLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

const initEscalationEngine = () => {
  console.log('[Escalation Engine] Background Cron Scheduler initialized (running check every hour)...');

  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Escalation Engine] Running stale ticket check...');
      const thresholdDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

      const staleComplaints = await Complaint.find({
        status: { $in: ['Submitted', 'Assigned'] },
        isEscalated: false,
        createdAt: { $lt: thresholdDate },
      });

      if (staleComplaints.length === 0) {
        console.log('[Escalation Engine] No stale tickets requiring escalation.');
        return;
      }

      const admins = await User.find({ role: 'admin' });

      for (const complaint of staleComplaints) {
        complaint.isEscalated = true;
        complaint.escalatedAt = new Date();
        complaint.priority = 'Critical';
        await complaint.save();

        await ComplaintTimelineLog.create({
          complaintId: complaint._id,
          actionBy: admins[0] ? admins[0]._id : complaint.studentId,
          previousStatus: complaint.status,
          newStatus: complaint.status,
          comment: 'Auto-escalated to Critical priority by System Scheduler (>48 hours without resolution).',
        });

        // Notify Admins
        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            title: `ESCALATION ALERT: Ticket ${complaint.ticketId}`,
            message: `Ticket "${complaint.title}" has been auto-escalated to Critical priority.`,
            link: `/admin/dashboard`,
          });
        }

        console.log(`[Escalation Engine] Escalated Ticket ${complaint.ticketId} to Critical priority`);
      }
    } catch (error) {
      console.error('[Escalation Engine] Error during escalation cron job:', error.message);
    }
  });
};

module.exports = { initEscalationEngine };
