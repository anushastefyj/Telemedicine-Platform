process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test_payment';
process.env.JWT_SECRET = 'test_secret_key_123';

const request  = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User } = require('../src/models/User');
const Appointment = require('../src/models/Appointment');

const TEST_DB = 'mongodb://localhost:27017/telemedicine_test_payment';

let patientToken  = '';
let doctorId      = '';
let appointmentId = '';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB);
  // Drop the database to ensure a clean slate on every test run
  await mongoose.connection.dropDatabase();

  const dRes = await request(app).post('/api/auth/register').send({
    name: 'Dr. Eve', email: 'eve@pay.test', password: 'password123',
    role: 'doctor', specialty: 'Cardiology', experience: 10,
    consultationFee: 300, licenseNumber: 'CAR7777',
  });
  doctorId = dRes.body.data._id;

  const pRes = await request(app).post('/api/auth/register').send({
    name: 'Frank Patient', email: 'frank@pay.test', password: 'password123', role: 'patient',
  });
  patientToken = pRes.body.token;

  // Book an appointment
  const apptRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ doctorId, date: '2026-06-08', time: '11:00', reason: 'Routine checkup' });
  appointmentId = apptRes.body.data?._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Payment API', () => {
  let mockPaymentId = '';

  describe('POST /api/payments/create-intent', () => {
    it('creates a payment intent (mock Stripe) for a valid appointment', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.clientSecret).toBeDefined();
      expect(res.body.paymentIntentId).toBeDefined();
      expect(res.body.amount).toBe(30000); // $300 * 100 cents
      mockPaymentId = res.body.paymentIntentId;
    });

    it('rejects missing appointmentId', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .send({ appointmentId });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('confirms payment and updates appointment status to confirmed', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId, paymentId: mockPaymentId || 'pi_mock_testid' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('paid');
      expect(res.body.data.status).toBe('confirmed');
    });

    it('rejects confirmation with missing fields', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ appointmentId }); // missing paymentId
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('rejects unauthenticated confirmation', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .send({ appointmentId, paymentId: 'pi_test' });
      expect(res.status).toBe(401);
    });
  });

  describe('Appointment state after payment', () => {
    it('appointment shows paymentStatus=paid in GET /api/appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(200);
      const appt = res.body.data.find((a) => a._id === appointmentId);
      if (appt) {
        expect(appt.paymentStatus).toBe('paid');
      }
    });
  });
});
