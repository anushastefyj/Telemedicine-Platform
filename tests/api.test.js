process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test';
process.env.JWT_SECRET = 'test_secret_key_123';

const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User } = require('../src/models/User');
const Appointment = require('../src/models/Appointment');
const Admin = require('../src/models/Admin');

const testMongoUri = 'mongodb://localhost:27017/telemedicine_test';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(testMongoUri);
});

afterAll(async () => {
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await Admin.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Telemedicine Platform API Integration Tests', () => {
  let patientToken = '';
  let doctorToken = '';
  let adminToken = '';
  let doctorId = '';
  let patientId = '';
  let appointmentId = '';

  describe('Auth Endpoints', () => {
    it('should register a new patient user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Patient',
          email: 'alice@test.com',
          password: 'password123',
          role: 'patient',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      patientId = res.body.data._id;
    });

    it('should register a new doctor user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Bob',
          email: 'bob@test.com',
          password: 'password123',
          role: 'doctor',
          specialty: 'Cardiologist',
          experience: 10,
          consultationFee: 150,
          licenseNumber: 'DOC12345',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      doctorId = res.body.data._id;
    });

    it('should seed a new admin user directly', async () => {
      const admin = new Admin({
        email: 'admin@test.com',
        password: 'password123',
      });
      await admin.save();
      expect(admin._id).toBeDefined();
    });

    it('should log in the patient and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      patientToken = res.body.token;
    });

    it('should log in the doctor and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bob@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      doctorToken = res.body.token;
    });

    it('should log in the admin and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      adminToken = res.body.token;
    });
  });

  describe('Appointment & Availability Endpoints', () => {
    it('should let doctor configure custom availability schedule', async () => {
      const res = await request(app)
        .put('/api/availability/me/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          availability: [
            {
              dayOfWeek: 'Monday',
              startTime: '09:00',
              endTime: '12:00',
              isAvailable: true,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get available slots for doctor on a specific Monday', async () => {
      const res = await request(app)
        .get(`/api/availability/${doctorId}/available-slots?date=2026-06-08`); // 2026-06-08 is a Monday

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should book an appointment as patient', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          date: '2026-06-08',
          time: '10:00',
          reason: 'Routine Cardiology Checkup',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      appointmentId = res.body.data._id;
    });
  });

  describe('Video Consultation Endpoints', () => {
    it('should not allow room access if not within scheduled time slot', async () => {
      const res = await request(app)
        .get(`/api/video/room/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Dashboard Endpoints', () => {
    it('should block non-doctors from doctor dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboards/doctor')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });

    it('should let doctor view their dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboards/doctor')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.monthlyEarnings).toBeDefined();
    });

    it('should let patient view their dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboards/patient')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.upcomingAppointments).toBeDefined();
    });

    it('should let admin view their dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboards/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPatients).toBeDefined();
    });
  });

  describe('AI Feature Endpoints', () => {
    it('should check symptoms using OpenAI Mock Fallback', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: 'cough, runny nose, congestion' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.possibleConditions).toBeDefined();
    });

    it('should structure prescription text', async () => {
      const res = await request(app)
        .post('/api/ai/prescription-summary')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ prescriptionText: 'Aspirin 100mg once a day with dinner for 10 days' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.medicines).toBeDefined();
    });
  });
});
