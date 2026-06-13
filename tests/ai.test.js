process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test_ai';
process.env.JWT_SECRET = 'test_secret_key_123';

const request  = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User } = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/telemedicine_test_ai';

let patientToken = '';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB);
  // Drop the database to ensure a clean slate on every test run
  await mongoose.connection.dropDatabase();

  const pRes = await request(app).post('/api/auth/register').send({
    name: 'Grace AI', email: 'grace@ai.test', password: 'password123', role: 'patient',
  });
  patientToken = pRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('AI API', () => {
  describe('POST /api/ai/symptoms', () => {
    it('returns possible conditions for valid symptoms (mock fallback)', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: 'fever, headache, muscle pain' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.possibleConditions)).toBe(true);
      expect(res.body.data.possibleConditions.length).toBeGreaterThan(0);
      expect(res.body.data.recommendation).toBeDefined();
      expect(typeof res.body.data.suggestBookDoctor).toBe('boolean');
    });

    it('returns a recommendation field', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: 'cough and cold' });
      expect(res.status).toBe(200);
      expect(res.body.data.recommendation).toBeTruthy();
    });

    it('returns 400 for empty symptoms', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for missing symptoms field', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/ai/symptoms')
        .send({ symptoms: 'fever' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/ai/prescription-summary', () => {
    it('structures prescription text into medicines list (mock fallback)', async () => {
      const res = await request(app)
        .post('/api/ai/prescription-summary')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ prescriptionText: 'Paracetamol 500mg twice a day for 5 days after meals' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.medicines)).toBe(true);
      expect(res.body.data.medicines.length).toBeGreaterThan(0);
      expect(res.body.data.summary).toBeDefined();
    });

    it('returns 400 for empty prescription text', async () => {
      const res = await request(app)
        .post('/api/ai/prescription-summary')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ prescriptionText: '' });
      expect(res.status).toBe(400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/ai/prescription-summary')
        .send({ prescriptionText: 'Aspirin 100mg' });
      expect(res.status).toBe(401);
    });
  });
});
