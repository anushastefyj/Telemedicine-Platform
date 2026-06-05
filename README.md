# Telemedicine Platform Backend

This is the backend service for the Healthcare Appointment System (Telemedicine Platform) built with the MERN stack.

## Tech Stack
- **Node.js & Express** - Web application framework
- **MongoDB & Mongoose** - Database modeling and querying (using schema discriminators)
- **JWT** - User authentication and security
- **Stripe** - Secure payment integration
- **Google Gemini AI** - Symptom checking and prescription summaries
- **Nodemailer** - Automated email reminders
- **Multer & Cloudinary** - Patient medical records storage
- **Winston & Morgan** - Production logging
- **Jest & Supertest** - Automated integration testing

---

## Production Features Added

### 1. Essential Healthcare Modules
- **Video Consultation**: Handles secure WebRTC room access validation. Accessible only during scheduled slot times (+/- 15 min buffer).
- **Doctor Availability Scheduling**: Dynamically computes slot listings (30-minute intervals) for appointments, filtering out booked times and verifying active vacation settings.
- **Appointment Reminders**: Scans database using `node-cron` every 15 minutes, emailing patients 24 hours and 1 hour before scheduled consultation calls.
- **Medical Records**: Integrates Multer and Cloudinary storage allowing patients to securely upload and retrieve PDFs/images of lab reports.

### 2. Security and Middlewares
- **Rate Limiting**: Built specific rate limits using `express-rate-limit` (5 auth/payment requests per 10 mins, 100 general requests per 15 mins).
- **Hardened Headers**: Configured `helmet`, `xss-clean`, `hpp`, and `express-mongo-sanitize` to defend against attacks (CSRF, XSS, parameter pollution, NoSQL injection).
- **API Documentation**: Automated Swagger documentation exposed at `/api-docs` using JSDoc route configurations.

### 3. Role-Based Dashboards
- **Admin Dashboard**: Revenue statistics and user-appointment distributions.
- **Doctor Dashboard**: Today's schedules, monthly consultation earnings, unique patients, and ratings.
- **Patient Dashboard**: Upcoming/past appointments, prescriptions list, and uploaded medical reports.

### 4. Gemini AI Integrations
- **AI Symptom Checker**: Parses patient complaints to suggest likely conditions and direct patients to the right medical specialty.
- **AI Prescription Structuring**: Converts raw unstructured doctor texts into structured dosage, frequency, and instruction lists.

---

## Setup Instructions

### Prerequisites
- Node.js installed locally
- Local or cloud MongoDB instance
- Stripe Account (for payments)
- Cloudinary Account (for uploads)
- SMTP Mail Account (for email alerts)
- Google Gemini API Key (for AI features)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in details:
   ```bash
   cp .env.example .env
   ```

3. **Start the Application**
   - Development Mode (with hot reloading via Nodemon):
     ```bash
     npm run dev
     ```
   - Production Mode:
     ```bash
     npm start
     ```

4. **Run Automated Tests**
   ```bash
   npm test
   ```

5. **Local Docker Run**
   ```bash
   docker-compose up --build
   ```

---

## API Documentation Reference

Explore the full API documentation, route definitions, schemas, and try out endpoints by starting the server and navigating to:
*   **Swagger API Docs URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
