import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Calls
export const loginAPI = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getMeAPI = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updatePasswordAPI = async (passwords) => {
  const response = await API.post('/auth/update-password', passwords);
  return response.data;
};

// Doctor Calls
export const getDoctorsAPI = async (params = {}) => {
  const response = await API.get('/doctors', { params });
  return response.data;
};

export const getDoctorByIdAPI = async (id) => {
  const response = await API.get(`/doctors/${id}`);
  return response.data;
};

export const getMyDoctorProfileAPI = async () => {
  const response = await API.get('/doctors/me/profile');
  return response.data;
};

export const updateMyDoctorProfileAPI = async (data) => {
  const response = await API.put('/doctors/me/profile', data);
  return response.data;
};

export const getMyDoctorAppointmentsAPI = async () => {
  const response = await API.get('/doctors/me/appointments');
  return response.data;
};

// Appointment Calls
export const bookAppointmentAPI = async (appointmentData) => {
  const response = await API.post('/appointments', appointmentData);
  return response.data;
};

export const getAppointmentsAPI = async () => {
  const response = await API.get('/appointments');
  return response.data;
};

export const getAppointmentByIdAPI = async (id) => {
  const response = await API.get(`/appointments/${id}`);
  return response.data;
};

export const cancelAppointmentAPI = async (id) => {
  const response = await API.put(`/appointments/${id}/cancel`);
  return response.data;
};

export const confirmAppointmentAPI = async (id) => {
  const response = await API.put(`/appointments/${id}/confirm`);
  return response.data;
};

export const completeAppointmentAPI = async (id) => {
  const response = await API.put(`/appointments/${id}/complete`);
  return response.data;
};

// Prescription Calls
export const createPrescriptionAPI = async (prescriptionData) => {
  const response = await API.post('/prescriptions', prescriptionData);
  return response.data;
};

export const getPrescriptionByAppointmentAPI = async (appointmentId) => {
  const response = await API.get(`/prescriptions/appointment/${appointmentId}`);
  return response.data;
};

export const getPrescriptionsByPatientAPI = async (patientId) => {
  const response = await API.get(`/prescriptions/patient/${patientId}`);
  return response.data;
};

// Review Calls
export const addReviewAPI = async (reviewData) => {
  const response = await API.post('/reviews', reviewData);
  return response.data;
};

export const getReviewsByDoctorAPI = async (doctorId) => {
  const response = await API.get(`/reviews/doctor/${doctorId}`);
  return response.data;
};

// Payment Calls
export const createPaymentIntentAPI = async (data) => {
  const response = await API.post('/payments/create-intent', data);
  return response.data;
};

export const confirmPaymentAPI = async (data) => {
  const response = await API.post('/payments/confirm', data);
  return response.data;
};

export default API;
