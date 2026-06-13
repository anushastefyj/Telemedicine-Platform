import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAppointmentsAPI, cancelAppointmentAPI, getPrescriptionsByPatientAPI, getPatientRecordsAPI } from '../services/api';
import { 
  LayoutDashboard, Calendar, UserSearch, BrainCircuit, 
  Pill, MessageCircle, FolderHeart, Settings, LogOut, 
  Bell, Stethoscope, X 
} from 'lucide-react';

import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';

// Internal Tabs
import { OverviewTab, AppointmentsTab, PrescriptionsTab } from '../components/PatientCoreTabs';
import FindDoctorsTab from './FindDoctorsTab';
import DoctorDetailPage from './DoctorDetailPage';
import AICheckerTab from './AICheckerTab';
import MessagesTab from './MessagesTab';
import MedicalRecordsPage from './MedicalRecordsPage';
import ProfilePage from './ProfilePage';

const PatientDashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { socket } = useVideo(); // <--- Get socket from VideoContext
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [apptTab, setApptTab] = useState('upcoming');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  
  // Data state
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Real-time notifications
  const [popupNotification, setPopupNotification] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const appRes = await getAppointmentsAPI();
      if (appRes.success) setAppointments(appRes.data);

      if (user) {
        const presRes = await getPrescriptionsByPatientAPI(user._id);
        if (presRes.success) setPrescriptions(presRes.data);
        
        try {
          const recRes = await getPatientRecordsAPI(user._id);
          if (recRes.success) setRecords(recRes.data);
        } catch (e) { /* ignore records fetch error */ }
      }
    } catch (err) {
      setErrorMsg('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setPopupNotification(`New message from ${msg.sender?.name || 'Doctor'}`);
      setTimeout(() => setPopupNotification(null), 5000);
      // Optional: If on messages tab, we might want to refresh. But usually the MessagesTab handles its own state.
    };

    const handleNewRecord = (record) => {
      setPopupNotification(`A new Medical Report has been uploaded by your doctor.`);
      setTimeout(() => setPopupNotification(null), 5000);
      fetchDashboardData(); // Refresh records
    };

    socket.on('receive-message', handleNewMessage);
    socket.on('receive-medical-record', handleNewRecord);

    return () => {
      socket.off('receive-message', handleNewMessage);
      socket.off('receive-medical-record', handleNewRecord);
    };
  }, [socket]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await cancelAppointmentAPI(id);
      if (res.success) {
        setSuccessMsg('Appointment cancelled successfully');
        fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg('Failed to cancel appointment');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const upcoming = appointments.filter((app) => ['pending', 'confirmed'].includes(app.status));
  const past = appointments.filter((app) => ['completed', 'cancelled'].includes(app.status));
  
  const futureApps = [...upcoming].filter(app => new Date(app.appointmentDate) > new Date()).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  const nextAppt = futureApps[0] || null;

  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'find-doctors', name: 'Find a Doctor', icon: UserSearch },
    { id: 'ai-checker', name: 'AI Symptom Check', icon: BrainCircuit },
    { id: 'prescriptions', name: 'Prescriptions', icon: Pill },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'records', name: 'Medical Records', icon: FolderHeart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const getTabTitle = () => {
    if (activeTab === 'doctor-detail') return 'Doctor Profile';
    return navItems.find(n => n.id === activeTab)?.name || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} upcoming={upcoming} prescriptions={prescriptions} records={records} nextAppt={nextAppt} setActiveTab={setActiveTab} navigate={navigate} handleCancelAppointment={handleCancelAppointment} />;
      case 'appointments':
        return <AppointmentsTab apptTab={apptTab} setApptTab={setApptTab} upcoming={upcoming} past={past} setActiveTab={setActiveTab} handleCancelAppointment={handleCancelAppointment} />;
      case 'find-doctors':
        return <FindDoctorsTab onViewProfile={(docId) => { setSelectedDoctorId(docId); setActiveTab('doctor-detail'); }} />;
      case 'doctor-detail':
        return <DoctorDetailPage id={selectedDoctorId} onBack={() => setActiveTab('find-doctors')} />;
      case 'ai-checker':
        return <AICheckerTab setActiveTab={setActiveTab} />;
      case 'prescriptions':
        return <PrescriptionsTab prescriptions={prescriptions} />;
      case 'messages':
        return <MessagesTab />;
      case 'records':
        // Wrap it so it acts like a tab, hiding its original layout wrappers if any
        return <MedicalRecordsPage />;
      case 'settings':
        return <div className="fade-in bg-white rounded-2xl border border-slate-200 overflow-hidden"><ProfilePage /></div>;
      default:
        return <OverviewTab user={user} upcoming={upcoming} prescriptions={prescriptions} records={records} nextAppt={nextAppt} setActiveTab={setActiveTab} navigate={navigate} handleCancelAppointment={handleCancelAppointment} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafb] font-sans overflow-hidden">
      
      {/* Sidebar (Fixed, 240px, never unmounts) */}
      <div className="hidden md:flex flex-col w-[240px] bg-[#0F1117] flex-shrink-0 border-r border-[#1f2937] z-20">
        
        {/* Top Section */}
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

        {/* Patient Profile Strip */}
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
              <span className="text-white text-[14px] font-bold truncate">{user?.name}</span>
              <span className="bg-[#2c8a52] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 self-start">Patient</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#1f2937] mx-5 mb-3"></div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4">
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.location.pathname !== '/dashboard/patient') navigate('/dashboard/patient');
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
              if (window.location.pathname !== '/dashboard/patient') navigate('/dashboard/patient');
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
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('settings')}>
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

      {/* Mobile Bottom Bar Placeholder (for future) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 pb-safe z-50">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center ${activeTab==='overview'?'text-primary-600':'text-slate-400'}`}>
          <LayoutDashboard size={20} />
        </button>
        <button onClick={() => setActiveTab('appointments')} className={`flex flex-col items-center ${activeTab==='appointments'?'text-primary-600':'text-slate-400'}`}>
          <Calendar size={20} />
        </button>
        <button onClick={() => setActiveTab('find-doctors')} className={`flex flex-col items-center ${activeTab==='find-doctors'?'text-primary-600':'text-slate-400'}`}>
          <UserSearch size={20} />
        </button>
        <button onClick={() => setActiveTab('ai-checker')} className={`flex flex-col items-center ${activeTab==='ai-checker'?'text-primary-600':'text-slate-400'}`}>
          <BrainCircuit size={20} />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab==='settings'?'text-primary-600':'text-slate-400'}`}>
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default PatientDashboardLayout;
