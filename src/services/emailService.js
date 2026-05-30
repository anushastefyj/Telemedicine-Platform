const nodemailer = require('nodemailer');

// Create transporter using environment variables or a mock fallback
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback: Generate a test SMTP service from ethereal.email if no credentials are provided
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('Using Ethereal Mail test credentials:', testAccount.user);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('Failed to create Ethereal SMTP test account. Falling back to console-logging emails.');
      return {
        sendMail: async (mailOptions) => {
          console.log('\n--- EMAIL SENT (MOCK/CONSOLE) ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Text Body: ${mailOptions.text}`);
          console.log('---------------------------------\n');
          return { messageId: 'console-mock-id' };
        }
      };
    }
  }
};

let transporterPromise = createTransporter();

const sendEmail = async (options) => {
  const transporter = await transporterPromise;
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"CareSync Telemedicine" <noreply@caresync.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    // If using Ethereal, log the preview URL
    if (nodemailer.getTestMessageUrl) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) console.log(`Preview URL: ${url}`);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmation = async (appointment, patient, doctor) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Appointment Booked: Dr. ${doctor.name} - CareSync`;
  const text = `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.name} has been booked successfully.\n\nDate: ${dateStr}\nTime: ${appointment.time}\nReason: ${appointment.reason}\n\nPlease log in to your dashboard to complete the payment and attend the video consultation.\n\nBest regards,\nCareSync Telemedicine Platform`;
  const html = `
    <h3>Dear ${patient.name},</h3>
    <p>Your appointment with <strong>Dr. ${doctor.name}</strong> has been booked successfully.</p>
    <ul>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Time:</strong> ${appointment.time}</li>
      <li><strong>Reason:</strong> ${appointment.reason}</li>
    </ul>
    <p>Please log in to your dashboard to complete the payment and attend the video consultation.</p>
    <br/>
    <p>Best regards,<br/>CareSync Telemedicine Platform</p>
  `;

  return sendEmail({ to: patient.email, subject, text, html });
};

/**
 * Send Appointment 1-Hour Reminder Email
 */
const sendAppointmentReminder = async (appointment, patient, doctor) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Reminder: Appointment with Dr. ${doctor.name} in 1 hour - CareSync`;
  const text = `Dear ${patient.name},\n\nThis is a reminder that your scheduled virtual consultation with Dr. ${doctor.name} starts in 1 hour.\n\nDate: ${dateStr}\nTime: ${appointment.time}\n\nPlease click the link in your dashboard to join the video room.\n\nBest regards,\nCareSync Telemedicine Platform`;
  const html = `
    <h3>Dear ${patient.name},</h3>
    <p>This is a reminder that your scheduled virtual consultation with <strong>Dr. ${doctor.name}</strong> starts in <strong>1 hour</strong>.</p>
    <ul>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Time:</strong> ${appointment.time}</li>
    </ul>
    <p>Please click the link in your dashboard to join the video room.</p>
    <br/>
    <p>Best regards,<br/>CareSync Telemedicine Platform</p>
  `;

  return sendEmail({ to: patient.email, subject, text, html });
};

module.exports = {
  sendBookingConfirmation,
  sendAppointmentReminder,
};
