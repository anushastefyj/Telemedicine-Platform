process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/telemedicine_test_doctor';
process.env.JWT_SECRET = 'test_secret_key_123';

const request  = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/server');
const { User, Doctor } = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/telemedicine_test_doctor';

let doctorToken  = '';
let patientToken = '';
let doctorId     = '';

beforeAll(async () => {
  await mongoose.disconnect();
  await mongoose.connect(TEST_DB);
  // Drop the database to ensure a clean slate on every test run
  await mongoose.connection.dropDatabase();

  // Register doctor
  const dRes = await request(app).post('/api/auth/register').send({
    name: 'Dr. Alice', email: 'alice@doc.test', password: 'password123',
    role: 'doctor', specialty: 'Neurology', experience: 8,
    consultationFee: 200, licenseNumber: 'NLY8888',
  });
  doctorToken = dRes.body.token;

  // ✅ Fetch the actual Doctor profile _id (not the User _id)
  const listRes = await request(app).get('/api/doctors');
  doctorId = listRes.body.data[0]._id;

  // Register patient
  const pRes = await request(app).post('/api/auth/register').send({
    name: 'Bob Patient', email: 'bob@pat.test', password: 'password123', role: 'patient',
  });
  patientToken = pRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Doctor API', () => {
  describe('GET /api/doctors', () => {
    it('returns a list of doctors (public)', async () => {
      const res = await request(app).get('/api/doctors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('supports filtering by specialty', async () => {
      const res = await request(app).get('/api/doctors').query({ specialty: 'Neurology' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/doctors/:id', () => {
    it('returns doctor details by ID', async () => {
      const res = await request(app).get(`/api/doctors/${doctorId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.doctor._id).toBe(doctorId);
    });

    it('returns 404 for non-existent doctor', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/doctors/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/doctors/me/profile', () => {
    it('returns own profile for authenticated doctor', async () => {
      const res = await request(app)
        .get('/api/doctors/me/profile')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects unauthenticated access', async () => {
      const res = await request(app).get('/api/doctors/me/profile');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/doctors/me/profile', () => {
    it('lets doctor update own profile', async () => {
      const res = await request(app)
        .put('/api/doctors/me/profile')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ bio: 'Updated doctor bio.', consultationFee: 250 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('blocks patient from updating doctor profile', async () => {
      const res = await request(app)
        .put('/api/doctors/me/profile')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ bio: 'I am not a doctor.' });
      expect(res.status).toBe(403);
    });
  });
});
