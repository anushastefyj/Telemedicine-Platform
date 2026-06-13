process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test_auth';
process.env.JWT_SECRET = 'test_secret_key_123';

const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User } = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/telemedicine_test_auth';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB);
  // Drop the database to ensure a clean slate on every test run
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Auth API', () => {
  let patientToken = '';
  let patientId    = '';

  describe('POST /api/auth/register', () => {
    it('registers a new patient', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test Patient', email: 'patient@auth.test', password: 'password123', role: 'patient' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      patientId = res.body.data._id;
    });

    it('registers a new doctor', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Test', email: 'doctor@auth.test', password: 'password123',
          role: 'doctor', specialty: 'Dermatology', experience: 5,
          consultationFee: 100, licenseNumber: 'LIC99999',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup', email: 'patient@auth.test', password: 'password123', role: 'patient' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'noname@test.com', password: '123' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'patient@auth.test', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      patientToken = res.body.token;
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'patient@auth.test', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(patientId);
    });

    it('rejects request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects request with malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/update-password', () => {
    it('updates password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/update-password')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects wrong current password', async () => {
      const res = await request(app)
        .post('/api/auth/update-password')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ currentPassword: 'wrongcurrent', newPassword: 'newpassword456' });
      expect(res.status).toBe(401);
    });
  });
});
