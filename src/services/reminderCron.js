const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { User } = require('../models/User');
const Reminder = require('../models/Reminder');
const { sendTemplateEmail } = require('./emailService');

const scanAndSendReminders = async () => {
  console.log('Running appointment reminder scan...');
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      status: 'confirmed',
    });

    let sentTomorrowCount = 0;
    let sentOneHourCount = 0;

    for (const app of appointments) {
      const appTime = new Date(app.date);
      const [hours, minutes] = app.time.split(':').map(Number);
      appTime.setHours(hours, minutes, 0, 0);

      const diffInMs = appTime - now;
      const diffInMinutes = diffInMs / (1000 * 60);

      // 1. Check upcoming_24h reminder
      // Threshold: 23 hours to 25 hours (1380 to 1500 minutes)
      if (diffInMinutes >= 1380 && diffInMinutes <= 1500) {
        const existingReminder = await Reminder.findOne({
          appointmentId: app._id,
          type: 'upcoming_24h',
        });

        if (!existingReminder) {
          const patient = await User.findById(app.patientId);
          const doctor = await User.findById(app.doctorId);
          if (patient && doctor) {
            try {
              await sendTemplateEmail(patient, doctor, app, '24 Hours (Tomorrow)');
              await Reminder.create({
                appointmentId: app._id,
                type: 'upcoming_24h',
                status: 'sent',
              });
              sentTomorrowCount++;
            } catch (err) {
              await Reminder.create({
                appointmentId: app._id,
                type: 'upcoming_24h',
                status: 'failed',
              });
            }
          }
        }
      }

      // 2. Check upcoming_1h reminder
      // Threshold: 45 to 75 minutes
      if (diffInMinutes >= 45 && diffInMinutes <= 75) {
        const existingReminder = await Reminder.findOne({
          appointmentId: app._id,
          type: 'upcoming_1h',
        });

        if (!existingReminder) {
          const patient = await User.findById(app.patientId);
          const doctor = await User.findById(app.doctorId);
          if (patient && doctor) {
            try {
              await sendTemplateEmail(patient, doctor, app, '1 Hour');
              await Reminder.create({
                appointmentId: app._id,
                type: 'upcoming_1h',
                status: 'sent',
              });
              sentOneHourCount++;
            } catch (err) {
              await Reminder.create({
                appointmentId: app._id,
                type: 'upcoming_1h',
                status: 'failed',
              });
            }
          }
        }
      }
    }

    console.log(`Reminder scan completed. Sent: ${sentTomorrowCount} tomorrow reminders, ${sentOneHourCount} 1-hour reminders.`);
    return { sentTomorrowCount, sentOneHourCount };
  } catch (err) {
    console.error('Error during reminder scan:', err);
    throw err;
  }
};

// Setup cron schedule (runs every 15 minutes)
const initReminderCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    await scanAndSendReminders();
  });
  console.log('Cron job for appointment reminders initialized (every 15 minutes).');
};

module.exports = {
  scanAndSendReminders,
  initReminderCron,
};
