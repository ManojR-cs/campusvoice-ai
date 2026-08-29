const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require('../config/env');

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

const sendNotificationEmail = async ({ to, subject, htmlText }) => {
  if (!transporter) {
    console.log(`[Email Service] (Mock Delivery) To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: '"CampusVoice AI Alerts" <notifications@campusvoice.edu>',
      to,
      subject,
      html: htmlText,
    });
    console.log(`[Email Service] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Error sending email to ${to}:`, error.message);
    return false;
  }
};

module.exports = { sendNotificationEmail };
