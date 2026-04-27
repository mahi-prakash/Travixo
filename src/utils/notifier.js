const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Configure the email transporter
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to another service if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an alert email to the admin
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 */
const sendAlert = async (subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    logger.warn('⚠️ Email alerts skipped: EMAIL_USER, EMAIL_PASS, or ADMIN_EMAIL missing in .env');
    return;
  }

  try {
    const mailOptions = {
      from: `"Travstory AI Monitor" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 AI ALERT: ${subject}`,
      text: `${text}\n\nTimestamp: ${new Date().toLocaleString()}`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`📧 Alert email sent to admin: ${subject}`);
  } catch (error) {
    logger.error(`❌ Failed to send alert email: ${error.message}`);
  }
};

module.exports = {
  sendAlert,
};
