import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import PatientDashboardLayout from './pages/PatientDashboardLayout';
import DoctorDashboardLayout from './pages/DoctorDashboardLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import ProfilePage from './pages/ProfilePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import NotFoundPage from './pages/NotFoundPage';

import { useAuth } from './context/AuthContext';

const SharedLayoutWrapper = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Wait for user to load
  
  if (user?.role === 'doctor') return <DoctorDashboardLayout>{children}</DoctorDashboardLayout>;
  if (user?.role === 'patient') return <PatientDashboardLayout>{children}</PatientDashboardLayout>;
  
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

const AppContent = () => {
  const location = window.location.pathname; // Fallback, better to use useLocation but need to import it
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* We handle Navbar visibility inside Navbar.jsx, but we'll add '/' to it */}
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* General Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><SharedLayoutWrapper><ProfilePage /></SharedLayoutWrapper></ProtectedRoute>} />
          <Route path="/appointments/:id" element={<ProtectedRoute><SharedLayoutWrapper><AppointmentDetailPage /></SharedLayoutWrapper></ProtectedRoute>} />
          <Route path="/video-call/:videoCallId" element={<ProtectedRoute><SharedLayoutWrapper><VideoConsultationPage /></SharedLayoutWrapper></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><SharedLayoutWrapper><PaymentSuccessPage /></SharedLayoutWrapper></ProtectedRoute>} />
          <Route path="/payment/failure" element={<ProtectedRoute><SharedLayoutWrapper><PaymentFailurePage /></SharedLayoutWrapper></ProtectedRoute>} />

          {/* Patient-Only Routes */}
          <Route path="/dashboard/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboardLayout /></ProtectedRoute>} />
          <Route path="/book-appointment/:doctorId" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboardLayout><BookAppointmentPage /></PatientDashboardLayout></ProtectedRoute>} />

          {/* Doctor-Only Routes */}
          <Route path="/dashboard/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboardLayout /></ProtectedRoute>} />

          {/* Admin-Only Routes */}
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer Conditional Rendering handled via CSS class for now, or just remove global footer and move to layouts later. For now, hide on home/login/register */}
      { !['/', '/login', '/register'].includes(window.location.pathname) && (
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ASISHCARE CONSULTING. All rights reserved.
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <VideoProvider>
          <AppContent />
        </VideoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
