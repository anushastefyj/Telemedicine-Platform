process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test_appt';
process.env.JWT_SECRET = 'test_secret_key_123';

const request  = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User } = require('../src/models/User');
const Appointment = require('../src/models/Appointment');

const TEST_DB = 'mongodb://localhost:27017/telemedicine_test_appt';

let patientToken  = '';
let doctorToken   = '';
let doctorId      = '';
let patientId     = '';
let appointmentId = '';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB);
  // Drop the database to ensure a clean slate on every test run
  await mongoose.connection.dropDatabase();

  const dRes = await request(app).post('/api/auth/register').send({
    name: 'Dr. Carla', email: 'carla@appt.test', password: 'password123',
    role: 'doctor', specialty: 'Orthopedics', experience: 6,
    consultationFee: 120, licenseNumber: 'ORT5555',
  });
  doctorToken = dRes.body.token;
  doctorId    = dRes.body.data._id;

  const pRes = await request(app).post('/api/auth/register').send({
    name: 'Dan Patient', email: 'dan@appt.test', password: 'password123', role: 'patient',
  });
  patientToken = pRes.body.token;
  patientId    = pRes.body.data._id;

  // Set doctor availability
  await request(app)
    .put('/api/availability/me/availability')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({ availability: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true }] });
});

afterAll(async () => {
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Appointment API', () => {
  describe('POST /api/appointments', () => {
    it('allows patient to book an appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ doctorId, date: '2026-06-08', time: '10:00', reason: 'Knee pain' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.doctorId).toBe(doctorId);
      appointmentId = res.body.data._id;
    });

    it('rejects booking without auth', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({ doctorId, date: '2026-06-08', time: '11:00', reason: 'Test' });
      expect(res.status).toBe(401);
    });

    it('rejects booking with missing fields', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ doctorId });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/appointments', () => {
    it('returns appointments for authenticated user', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('returns appointment details by ID', async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(appointmentId);
    });

    it('returns 404 for non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/appointments/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/appointments/:id/confirm', () => {
    it('allows doctor to confirm an appointment', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('blocks patient from confirming an appointment', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}/confirm`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/appointments/:id/cancel', () => {
    it('allows patient to cancel own appointment', async () => {
      // Book a new appointment to cancel
      const bookRes = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ doctorId, date: '2026-06-08', time: '14:00', reason: 'Test cancel' });
      const apptId = bookRes.body.data._id;

      const res = await request(app)
        .put(`/api/appointments/${apptId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('PUT /api/appointments/:id/complete', () => {
    it('allows doctor to mark appointment as completed', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });
});
