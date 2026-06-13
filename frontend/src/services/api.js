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

const formatAppointments = (response) => {
  if (response.data) {
    if (Array.isArray(response.data)) {
      response.data = response.data.map(app => ({
        ...app,
        appointmentDate: app.date && app.time ? new Date(`${app.date.split('T')[0]}T${app.time}:00`) : app.date
      }));
    } else {
      const app = response.data;
      if (app.date && app.time) {
        response.data.appointmentDate = new Date(`${app.date.split('T')[0]}T${app.time}:00`);
      }
    }
  }
  return response.data;
};

export const getMyDoctorAppointmentsAPI = async () => {
  const response = await API.get('/doctors/me/appointments');
  return formatAppointments(response);
};

// Appointment Calls
export const bookAppointmentAPI = async (appointmentData) => {
  const response = await API.post('/appointments', appointmentData);
  return response.data;
};

export const getAppointmentsAPI = async () => {
  const response = await API.get('/appointments');
  return formatAppointments(response);
};

export const getAppointmentByIdAPI = async (id) => {
  const response = await API.get(`/appointments/${id}`);
  return formatAppointments(response);
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

// Get all prescriptions written by doctor
export const getDoctorPrescriptionsAPI = async () => {
  const response = await API.get('/prescriptions/doctor');
  return response.data;
};

// Update medication adherence (mark as taken)
export const updateMedicationAdherenceAPI = async (prescriptionId, medicationId) => {
  const response = await API.put(`/prescriptions/${prescriptionId}/medications/${medicationId}/take`);
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

// Medical Records Calls
export const getPatientRecordsAPI = async (patientId) => {
  const response = await API.get(`/records/patient/${patientId}`);
  return response.data;
};

export const getRecordByIdAPI = async (id) => {
  const response = await API.get(`/records/${id}`);
  return response.data;
};

export const uploadRecordAPI = async (formData) => {
  const response = await API.post('/records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteRecordAPI = async (id) => {
  const response = await API.delete(`/records/${id}`);
  return response.data;
};

export const createReportRecordAPI = async (reportData) => {
  const response = await API.post('/records', reportData);
  return response.data;
};

// Message Calls
export const getContactsAPI = async () => {
  const response = await API.get('/messages/contacts');
  return response.data;
};

export const getMessagesAPI = async (userId) => {
  const response = await API.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessageAPI = async (userId, content) => {
  const response = await API.post(`/messages/${userId}`, { content });
  return response.data;
};

export const markMessagesReadAPI = async (userId) => {
  const response = await API.put(`/messages/${userId}/read`);
  return response.data;
};

// Admin Calls
export const getAdminUsersAPI = async (params = {}) => {
  const response = await API.get('/admin/users', { params });
  return response.data;
};

export const getAdminDoctorsAPI = async () => {
  const response = await API.get('/admin/doctors');
  return response.data;
};

export const getAdminAppointmentsAPI = async () => {
  const response = await API.get('/admin/appointments');
  return formatAppointments(response);
};

export const getAdminRevenueAPI = async () => {
  const response = await API.get('/admin/revenue');
  return response.data;
};

export const deleteAdminUserAPI = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};

// AI Calls
export const analyzeSymptomsAPI = async (data) => {
  const response = await API.post('/ai/symptoms', data);
  return response.data;
};

export const summarizePrescriptionAPI = async (data) => {
  const response = await API.post('/ai/prescription-summary', data);
  return response.data;
};

export const uploadProfilePhotoAPI = async (formData, onUploadProgress) => {
  const response = await API.put('/auth/profile-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
};

export default API;
