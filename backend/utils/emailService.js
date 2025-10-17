import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email templates
const emailTemplates = {
  bugAssignment: (bugTitle, assignedTo, projectName, bugLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🐛 New Bug Assigned</h2>
        </div>
        <div class="content">
          <p>Hi ${assignedTo},</p>
          <p>A new bug has been assigned to you:</p>
          <h3>${bugTitle}</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p>Please review and start working on this bug.</p>
          <a href="${bugLink}" class="button">View Bug Details</a>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  projectAssignment: (projectName, assignedTo, role, projectLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 New Project Assignment</h2>
        </div>
        <div class="content">
          <p>Hi ${assignedTo},</p>
          <p>You have been added to a new project:</p>
          <h3>${projectName}</h3>
          <p><strong>Your Role:</strong> ${role}</p>
          <a href="${projectLink}" class="button">View Project</a>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name, resetLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { color: #e74c3c; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p class="warning">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bugResolved: (bugTitle, resolvedBy, projectName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Bug Resolved</h2>
        </div>
        <div class="content">
          <p>Great news!</p>
          <p>The following bug has been resolved:</p>
          <h3>${bugTitle}</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Resolved by:</strong> ${resolvedBy}</p>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bugCreated: (bugTitle, reporterName, projectName, priority, bugLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .priority { padding: 5px 10px; border-radius: 5px; color: white; font-weight: bold; }
        .critical { background: #dc3545; }
        .high { background: #fd7e14; }
        .medium { background: #ffc107; color: #333; }
        .low { background: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🐛 New Bug Reported</h2>
        </div>
        <div class="content">
          <p>A new bug has been reported:</p>
          <h3>${bugTitle}</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Reported by:</strong> ${reporterName}</p>
          <p><strong>Priority:</strong> <span class="priority ${priority}">${priority.toUpperCase()}</span></p>
          <p>Please review and assign to a developer.</p>
          <a href="${bugLink}" class="button">View Bug & Assign</a>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bugReopened: (bugTitle, developerName, projectName, testerName, bugLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: #333; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #ffc107; color: #333; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>↻ Bug Reopened</h2>
        </div>
        <div class="content">
          <p>Hi ${developerName},</p>
          <p>A bug you resolved has been reopened:</p>
          <h3>${bugTitle}</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Reopened by:</strong> ${testerName}</p>
          <p>The tester found that the issue still exists. Please review and fix again.</p>
          <a href="${bugLink}" class="button">View Bug Details</a>
        </div>
        <div class="footer">
          <p>Bug Tracker Team</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

// Specific email functions
export const sendBugAssignmentEmail = async (email, bugTitle, assignedTo, projectName, bugLink) => {
  await sendEmail({
    email,
    subject: `New Bug Assigned: ${bugTitle}`,
    html: emailTemplates.bugAssignment(bugTitle, assignedTo, projectName, bugLink)
  });
};

export const sendProjectAssignmentEmail = async (email, projectName, assignedTo, role, projectLink) => {
  await sendEmail({
    email,
    subject: `New Project Assignment: ${projectName}`,
    html: emailTemplates.projectAssignment(projectName, assignedTo, role, projectLink)
  });
};

export const sendPasswordResetEmail = async (email, name, resetLink) => {
  await sendEmail({
    email,
    subject: 'Password Reset Request',
    html: emailTemplates.passwordReset(name, resetLink)
  });
};

export const sendBugResolvedEmail = async (email, bugTitle, resolvedBy, projectName) => {
  await sendEmail({
    email,
    subject: `Bug Resolved: ${bugTitle}`,
    html: emailTemplates.bugResolved(bugTitle, resolvedBy, projectName)
  });
};

export const sendBugCreatedEmail = async (email, bugTitle, reporterName, projectName, priority, bugLink) => {
  await sendEmail({
    email,
    subject: `New Bug Reported: ${bugTitle}`,
    html: emailTemplates.bugCreated(bugTitle, reporterName, projectName, priority, bugLink)
  });
};

export const sendBugReopenedEmail = async (email, bugTitle, developerName, projectName, testerName, bugLink) => {
  await sendEmail({
    email,
    subject: `Bug Reopened: ${bugTitle}`,
    html: emailTemplates.bugReopened(bugTitle, developerName, projectName, testerName, bugLink)
  });
};
