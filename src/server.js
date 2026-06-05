const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');
const logger = require('./middleware/logger');
const swaggerSpec = require('../swagger.config');
const { initReminderCron } = require('./services/reminderCron');
const { authLimiter, generalLimiter, paymentLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const videoRoutes = require('./routes/videoRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));

// 1. Security Middlewares
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Configure CORS to accept only allowed origins or local fallback
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 2. Rate Limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/payments', paymentLimiter);
app.use('/api', generalLimiter);

// 3. Logger setup (Morgan routing into Winston)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Serve Swagger specification JSON
app.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

// Simple healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Initialize Cron Jobs (only if not running Jest tests)
if (process.env.NODE_ENV !== 'test') {
  initReminderCron();
}

// Socket.io Setup
const socketIo = require('socket.io');
const socketAuth = require('./middleware/socketAuth');
const Appointment = require('./models/Appointment');

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Map to store connected users: userId -> socketId
const connectedUsers = new Map();

io.use(socketAuth);

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  const role = socket.user.role;

  connectedUsers.set(userId, socket.id);
  logger.info(`User connected: ${userId} (${role}) on socket ${socket.id}`);

  // Notify other users if a doctor goes online
  if (role === 'doctor') {
    socket.broadcast.emit('doctor-online', { doctorId: userId, name: socket.user.name });
  }

  // Join video consultation room
  socket.on('join-room', async ({ appointmentId }) => {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return socket.emit('error', 'Appointment not found');
      }

      const isPatient = appointment.patientId.toString() === userId;
      const isDoctor = appointment.doctorId.toString() === userId;

      if (!isPatient && !isDoctor) {
        return socket.emit('error', 'Unauthorized to join this room');
      }

      socket.join(appointmentId);
      logger.info(`Socket ${socket.id} joined room ${appointmentId}`);

      socket.to(appointmentId).emit('user-joined', { userId, role });

      const clientsInRoom = io.sockets.adapter.rooms.get(appointmentId);
      if (clientsInRoom && clientsInRoom.size >= 2 && appointment.status === 'confirmed') {
        appointment.status = 'in-progress';
        appointment.callStatus = 'active';
        appointment.videoCallId = appointmentId;
        await appointment.save();
        io.to(appointmentId).emit('appointment-status-updated', { appointmentId, status: 'in-progress' });
      }
    } catch (err) {
      logger.error(`Error on join-room: ${err.message}`);
    }
  });

  socket.on('offer', ({ appointmentId, offer }) => {
    socket.to(appointmentId).emit('offer', { offer });
  });

  socket.on('answer', ({ appointmentId, answer }) => {
    socket.to(appointmentId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ appointmentId, candidate }) => {
    socket.to(appointmentId).emit('ice-candidate', { candidate });
  });

  socket.on('mute-audio', ({ appointmentId }) => {
    socket.to(appointmentId).emit('mute-audio');
  });

  socket.on('unmute-audio', ({ appointmentId }) => {
    socket.to(appointmentId).emit('unmute-audio');
  });

  socket.on('toggle-video', ({ appointmentId }) => {
    socket.to(appointmentId).emit('toggle-video');
  });

  socket.on('untoggle-video', ({ appointmentId }) => {
    socket.to(appointmentId).emit('untoggle-video');
  });

  socket.on('call-ended', async ({ appointmentId }) => {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.callStatus = 'ended';
        appointment.status = 'completed';
        await appointment.save();
        io.to(appointmentId).emit('appointment-status-updated', { appointmentId, status: 'completed' });
      }
      io.to(appointmentId).emit('call-ended');
    } catch (err) {
      logger.error(`Error ending call: ${err.message}`);
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    logger.info(`User disconnected: ${userId}`);
  });
});

const sendRealTimeNotification = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io, sendRealTimeNotification };
