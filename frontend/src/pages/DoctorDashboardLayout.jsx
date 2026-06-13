import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, DollarSign, 
  Settings, LogOut, Bell, Stethoscope, MessageCircle, FolderHeart, X
} from 'lucide-react';
import { 
  getMyDoctorAppointmentsAPI, 
  confirmAppointmentAPI, 
  completeAppointmentAPI, 
  cancelAppointmentAPI 
} from '../services/api';

import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { OverviewTab, AppointmentsTab, PatientsTab, EarningsTab } from '../components/DoctorCoreTabs';
import MedicalRecordsTab from '../components/DoctorCoreTabs/MedicalRecordsTab';
import MessagesTab from './MessagesTab';
import ProfilePage from './ProfilePage';

const DoctorDashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { socket } = useVideo();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Real-time notifications
  const [popupNotification, setPopupNotification] = useState(null);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await getMyDoctorAppointmentsAPI();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load doctor appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDoctorAppointments();
  }, [user]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setPopupNotification(`New message from ${msg.sender?.name || 'Patient'}`);
      setTimeout(() => setPopupNotification(null), 5000);
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket]);

  const handleConfirm = async (id) => {
    try {
      const res = await confirmAppointmentAPI(id);
      if (res.success) {
        setSuccessMsg('Appointment confirmed successfully!');
        fetchDoctorAppointments();
      }
    } catch (err) {
      setErrorMsg('Failed to confirm appointment');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await completeAppointmentAPI(id);
      if (res.success) {
        setSuccessMsg('Appointment marked as completed!');
        fetchDoctorAppointments();
      }
    } catch (err) {
      setErrorMsg('Failed to complete appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await cancelAppointmentAPI(id);
      if (res.success) {
        setSuccessMsg('Appointment cancelled.');
        fetchDoctorAppointments();
      }
    } catch (err) {
      setErrorMsg('Failed to cancel appointment');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const activeAppointments = appointments.filter((app) => ['pending', 'confirmed'].includes(app.status));
  const completedCount = appointments.filter((app) => app.status === 'completed').length;
  const totalEarnings = appointments
    .filter((app) => app.status === 'completed' && app.paymentStatus === 'paid')
    .reduce((acc, current) => acc + (current.doctorId?.consultationFee || 0), 0);

  const navItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'earnings', name: 'Earnings', icon: DollarSign },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'records', name: 'Medical Records', icon: FolderHeart },
  ];

  const getTabTitle = () => {
    if (activeTab === 'settings') return 'Settings';
    return navItems.find(n => n.id === activeTab)?.name || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab 
          appointments={appointments}
          activeAppointments={activeAppointments}
          completedCount={completedCount}
          totalEarnings={totalEarnings}
          handleConfirm={handleConfirm}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
        />;
      case 'appointments':
        return <AppointmentsTab 
          appointments={appointments}
          handleConfirm={handleConfirm}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
        />;
      case 'patients':
        return <PatientsTab />;
      case 'earnings':
        return <EarningsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'records':
        return <MedicalRecordsTab appointments={appointments} />;
      case 'settings':
        return <div className="fade-in bg-white rounded-2xl border border-slate-200 overflow-hidden"><ProfilePage /></div>;
      default:
        return <OverviewTab 
          appointments={appointments}
          activeAppointments={activeAppointments}
          completedCount={completedCount}
          totalEarnings={totalEarnings}
          handleConfirm={handleConfirm}
          handleComplete={handleComplete}
          handleCancel={handleCancel}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafb] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[240px] bg-[#0F1117] flex-shrink-0 border-r border-[#1f2937] z-20">
        <div className="p-5">
          <div className="flex items-center space-x-2">
            <Stethoscope className="text-[#4ade80]" size={24} />
            <div className="flex flex-col">
              <span className="text-white text-[16px] font-bold leading-tight">ASISHCARE</span>
              <span className="text-[#2c8a52] text-[11px] font-bold uppercase tracking-wider leading-none">Consulting</span>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-[#1f2937] mx-5 mb-5"></div>

        {/* Doctor Profile Strip */}
        <div className="px-5 mb-5">
          <div className="flex items-center space-x-3 bg-[#1f2937]/50 p-3 rounded-xl border border-[#374151]">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#2c8a52] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-white text-[14px] font-bold truncate">Dr. {user?.name}</span>
              <span className="bg-[#2c8a52] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 self-start">Doctor</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#1f2937] mx-5 mb-3"></div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.location.pathname !== '/dashboard/doctor') navigate('/dashboard/doctor');
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#2c8a52]/15 border-l-4 border-[#2c8a52] text-[#4ade80]' 
                    : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon size={20} className="mr-3 shrink-0" />
                <span className="text-[14px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto px-3 pb-5 pt-3 border-t border-[#1f2937]">
          <button
            onClick={() => {
              setActiveTab('settings');
              if (window.location.pathname !== '/dashboard/doctor') navigate('/dashboard/doctor');
            }}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all mb-1 ${
              activeTab === 'settings' 
                ? 'bg-[#2c8a52]/15 border-l-4 border-[#2c8a52] text-[#4ade80]' 
                : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-white border-l-4 border-transparent'
            }`}
          >
            <Settings size={20} className="mr-3 shrink-0" />
            <span className="text-[14px] font-medium">Settings</span>
          </button>
          
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); window.location.reload(); }}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-[#9ca3af] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors group border-l-4 border-transparent"
          >
            <LogOut size={20} className="mr-3 shrink-0 group-hover:text-[#ef4444]" />
            <span className="text-[14px] font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <h1 className="text-[18px] font-bold text-slate-800">{children ? '' : getTabTitle()}</h1>
          
          <div className="flex items-center space-x-5">
            <button className="text-slate-500 hover:text-primary-600 relative transition">
              <Bell size={20} />
            </button>
            
            <div className="flex items-center cursor-pointer" onClick={() => { setActiveTab('settings'); if (window.location.pathname !== '/dashboard/doctor') navigate('/dashboard/doctor'); }}>
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Avatar" className="w-[36px] h-[36px] rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-[36px] h-[36px] rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
          
          {/* Real-time Popup Notification */}
          {popupNotification && (
            <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="bg-primary-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 border border-primary-500">
                <Bell size={20} className="text-white animate-pulse" />
                <span className="font-medium text-sm">{popupNotification}</span>
                <button onClick={() => setPopupNotification(null)} className="ml-4 text-primary-200 hover:text-white transition">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {children ? children : renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Bar Placeholder */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 pb-safe z-50">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center ${activeTab==='overview'?'text-primary-600':'text-slate-400'}`}>
          <LayoutDashboard size={20} />
        </button>
        <button onClick={() => setActiveTab('appointments')} className={`flex flex-col items-center ${activeTab==='appointments'?'text-primary-600':'text-slate-400'}`}>
          <Calendar size={20} />
        </button>
        <button onClick={() => setActiveTab('patients')} className={`flex flex-col items-center ${activeTab==='patients'?'text-primary-600':'text-slate-400'}`}>
          <Users size={20} />
        </button>
        <button onClick={() => setActiveTab('earnings')} className={`flex flex-col items-center ${activeTab==='earnings'?'text-primary-600':'text-slate-400'}`}>
          <DollarSign size={20} />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab==='settings'?'text-primary-600':'text-slate-400'}`}>
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
