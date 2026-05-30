# Telemedicine Platform Backend

This is the backend service for the Healthcare Appointment System (Telemedicine Platform) built with the MERN stack.

## Tech Stack
- **Node.js & Express** - Web application framework
- **MongoDB & Mongoose** - Database modeling and querying (using schema discriminators)
- **JWT** - User authentication and security
- **Stripe** - Secure payment integration

## Getting Started

### Prerequisites
- Node.js installed locally
- Local or cloud MongoDB instance
- Stripe Account (for payment gateway integration)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in the details:
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

## API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (supports Patient and Doctor specifics based on `role`)
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/me` - Retrieve current user profile (requires Auth header)
- `POST /api/auth/update-password` - Change password (requires Auth header)

### Doctors (`/api/doctors`)
- `GET /api/doctors` - Find doctors (filters: `specialty`, `rating`, `maxFee`)
- `GET /api/doctors/:id` - Get a doctor's profile and patient reviews
- `GET /api/doctors/me/profile` - Get logge-in doctor's profile
- `PUT /api/doctors/me/profile` - Update doctor profile
- `GET /api/doctors/me/appointments` - Get appointments assigned to the logged-in doctor

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Fetch list of user's appointments (automatically scoped by Role)
- `GET /api/appointments/:id` - View details for an appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment (Doctor only)
- `PUT /api/appointments/:id/complete` - Mark appointment as completed (Doctor only)

### Prescriptions (`/api/prescriptions`)
- `POST /api/prescriptions` - Add prescription (Doctor only)
- `GET /api/prescriptions/appointment/:appointmentId` - Fetch prescription by appointment ID
- `GET /api/prescriptions/patient/:patientId` - Fetch all prescriptions for a specific patient

### Reviews (`/api/reviews`)
- `POST /api/reviews` - Add doctor review (Patient only, after completed appointment)
- `GET /api/reviews/doctor/:doctorId` - Get list of reviews for a doctor

### Payments (`/api/payments`)
- `POST /api/payments/create-intent` - Create Stripe Payment Intent for an appointment
- `POST /api/payments/confirm` - Record and confirm payment status in DB
