const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[email:skipped - no SMTP config] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'Society Maintenance Tracker <no-reply@societytracker.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return { error: err.message };
  }
};

const complaintStatusEmail = (residentName, complaint) => ({
  subject: `Your complaint status changed to "${complaint.status}"`,
  html: `
    <p>Hi ${residentName},</p>
    <p>The status of your complaint <strong>#${complaint._id}</strong> (${complaint.category}) has been updated to:</p>
    <p style="font-size: 16px;"><strong>${complaint.status}</strong></p>
    <p>${complaint.description}</p>
    <p>You can log in to the portal to view the full history of this complaint.</p>
    <p>— Society Maintenance Tracker</p>
  `,
});

const importantNoticeEmail = (residentName, notice) => ({
  subject: `📌 Important Notice: ${notice.title}`,
  html: `
    <p>Hi ${residentName},</p>
    <p>A new important notice has been posted:</p>
    <h3>${notice.title}</h3>
    <p>${notice.content}</p>
    <p>— Society Maintenance Tracker</p>
  `,
});

module.exports = { sendEmail, complaintStatusEmail, importantNoticeEmail };