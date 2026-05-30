const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');

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

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Simple healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

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
  console.log(`User connected: ${userId} (${role}) on socket ${socket.id}`);

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

      // Check if user is either patient or doctor for the appointment
      const isPatient = appointment.patientId.toString() === userId;
      const isDoctor = appointment.doctorId.toString() === userId;

      if (!isPatient && !isDoctor) {
        return socket.emit('error', 'Unauthorized to join this room');
      }

      socket.join(appointmentId);
      console.log(`Socket ${socket.id} joined room ${appointmentId}`);

      // Notify others in room
      socket.to(appointmentId).emit('user-joined', { userId, role });

      // Automatically change status of appointment to in-progress when both join (or just update status)
      const clientsInRoom = io.sockets.adapter.rooms.get(appointmentId);
      if (clientsInRoom && clientsInRoom.size >= 2 && appointment.status === 'confirmed') {
        appointment.status = 'in-progress';
        appointment.callStatus = 'active';
        appointment.videoCallId = appointmentId;
        await appointment.save();
        io.to(appointmentId).emit('appointment-status-updated', { appointmentId, status: 'in-progress' });
      }
    } catch (err) {
      console.error('Error on join-room:', err);
    }
  });

  // Relay WebRTC offer
  socket.on('offer', ({ appointmentId, offer }) => {
    socket.to(appointmentId).emit('offer', { offer });
  });

  // Relay WebRTC answer
  socket.on('answer', ({ appointmentId, answer }) => {
    socket.to(appointmentId).emit('answer', { answer });
  });

  // Relay WebRTC ice-candidate
  socket.on('ice-candidate', ({ appointmentId, candidate }) => {
    socket.to(appointmentId).emit('ice-candidate', { candidate });
  });

  // Audio/Video state controls sync
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

  // Call ending management
  socket.on('call-ended', async ({ appointmentId }) => {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.callStatus = 'ended';
        // Auto mark as completed when call ends
        appointment.status = 'completed';
        await appointment.save();
        io.to(appointmentId).emit('appointment-status-updated', { appointmentId, status: 'completed' });
      }
      io.to(appointmentId).emit('call-ended');
    } catch (err) {
      console.error('Error ending call:', err);
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

// Helper functions for external notifications
const sendRealTimeNotification = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io, sendRealTimeNotification };
