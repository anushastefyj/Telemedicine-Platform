import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <VideoProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctors" element={<DoctorListPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />

              {/* General Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/:id"
                element={
                  <ProtectedRoute>
                    <AppointmentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video-call/:videoCallId"
                element={
                  <ProtectedRoute>
                    <VideoConsultationPage />
                  </ProtectedRoute>
                }
              />

              {/* Patient-Only Protected Routes */}
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-appointment/:doctorId"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointmentPage />
                  </ProtectedRoute>
                }
              />

              {/* Doctor-Only Protected Routes */}
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CareSync. All rights reserved.
          </footer>
        </div>
      </VideoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
