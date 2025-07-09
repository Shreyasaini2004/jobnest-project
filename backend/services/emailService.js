// services/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendJobAlertEmail = async (userEmail, userName, job) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔔 New job that matches you: ${job.jobTitle}`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>We found a job that closely matches your profile:</p>
        <ul>
          <li><strong>Title:</strong> ${job.jobTitle}</li>
          <li><strong>Location:</strong> ${job.location || "N/A"}</li>
          <li><strong>Type:</strong> ${job.jobType || "N/A"}</li>
        </ul>
        <p><a href="https://your-app-domain.com/jobs/${job._id}">View job details</a></p>
        <p>Good luck!</p>
        <hr/>
        <small>This job was recommended based on your profile preferences and skills.</small>
      `
    });
    console.log(`📧 Job alert email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending job alert to ${userEmail}:`, error.message);
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Welcome to JobNest, ${userName}!`,
      html: `
        <h2>Welcome, ${userName}!</h2>
        <p>Thank you for joining JobNest. We're excited to have you on board.</p>
        <p>Start exploring jobs and opportunities tailored just for you.</p>
        <hr/>
        <small>If you have any questions, feel free to contact our support team.</small>
      `
    });
    console.log(`📧 Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${userEmail}:`, error.message);
  }
};

export { sendWelcomeEmail, sendJobAlertEmail };
