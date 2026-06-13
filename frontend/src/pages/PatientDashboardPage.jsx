import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentsAPI, cancelAppointmentAPI, getPrescriptionsByPatientAPI, getPatientRecordsAPI } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import PatientAppointmentCard from '../components/PatientAppointmentCard';
import NextAppointmentCard from '../components/NextAppointmentCard';
import PrescriptionCard from '../components/PrescriptionCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { LayoutDashboard, Calendar, UserSearch, BrainCircuit, Pill, MessageCircle, FolderHeart, Settings, LogOut, ArrowRight, Activity, Bell, Stethoscope, CalendarCheck, Clock } from 'lucide-react';
import MedicalRecordsPage from './MedicalRecordsPage';
import ProfilePage from './ProfilePage';
import { useNavigate } from 'react-router-dom';
import HealthJourneyTimeline from '../components/HealthJourneyTimeline';

const PatientDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [apptTab, setApptTab] = useState('upcoming');

  const fetchDashboardData = async () => {
    try {
      const appRes = await getAppointmentsAPI();
      if (appRes.success) {
        setAppointments(appRes.data);
      }

      if (user) {
        const presRes = await getPrescriptionsByPatientAPI(user._id);
        if (presRes.success) {
          setPrescriptions(presRes.data);
        }
        
        try {
          const recRes = await getPatientRecordsAPI(user._id);
          if (recRes.success) {
            setRecords(recRes.data);
          }
        } catch (e) {
          // ignore records fetch error
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

  const navLinks = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Appointments', icon: Calendar },
    { name: 'Find a Doctor', icon: UserSearch, path: '/doctors' },
    { name: 'AI Symptom Check', icon: BrainCircuit, path: '/ai-symptom-checker' },
    { name: 'Prescriptions', icon: Pill },
    { name: 'Messages', icon: MessageCircle },
    { name: 'Medical Records', icon: FolderHeart },
  ];

  const handleNavClick = (link) => {
    if (link.path) {
      navigate(link.path);
    } else {
      setActiveTab(link.name);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Appointments':
        const displayedAppts = apptTab === 'upcoming' ? upcoming : past;
        return (
          <div className="space-y-8 fade-in max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">All Appointments</h2>
              
              {/* Pill Tab Switcher */}
              <div className="flex items-center bg-slate-200/60 p-1.5 rounded-full self-start">
                <button 
                  onClick={() => setApptTab('upcoming')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${apptTab === 'upcoming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => setApptTab('past')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${apptTab === 'past' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Past
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {displayedAppts.length > 0 ? (
                displayedAppts.map(app => <PatientAppointmentCard key={app._id} appointment={app} onCancel={handleCancelAppointment} />)
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center mt-8">
                  <Calendar size={40} className="text-slate-400 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {apptTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {apptTab === 'upcoming' ? 'Your future consultations will appear here.' : 'You haven\'t had any consultations yet.'}
                  </p>
                  {apptTab === 'upcoming' && (
                    <button onClick={() => navigate('/doctors')} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition">
                      Book a consultation &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Prescriptions':
        return (
          <div className="space-y-8 fade-in max-w-3xl">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">All Prescriptions</h2>
            {prescriptions.length > 0 ? (
              <div className="space-y-8">
                {prescriptions.map((pres) => (
                  <PrescriptionCard key={pres._id} prescription={pres} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-8">
                <Pill size={40} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No active prescriptions</h3>
                <p className="text-sm text-slate-500 mb-0">They'll appear here after your consultation.</p>
              </div>
            )}
          </div>
        );
        
      case 'Messages':
        return (
          <div className="space-y-6 fade-in max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Messages</h2>
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center mt-8">
              <MessageCircle size={40} className="text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No messages yet</h3>
              <p className="text-sm text-slate-500 mb-0">Messaging is available after your first consultation.</p>
            </div>
          </div>
        );
      
      case 'Settings':
        return (
          <div className="fade-in bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
            <ProfilePage />
          </div>
        );

      case 'Overview':
      default:
        return (
          <div className="fade-in max-w-6xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Row 1 — Greeting */}
            <div className="flex flex-col">
              <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Good morning, {user?.name?.split(' ')[0]}</h1>
              <p className="text-[14px] text-slate-500 mt-1">Here's your health summary for today.</p>
            </div>

            {/* Row 2 — 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('Appointments')}>
                <div className="flex items-center space-x-3 mb-3">
                  <CalendarCheck className="text-primary-600" size={20} />
                  <h3 className="font-bold text-sm text-slate-500">Upcoming appointments</h3>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{upcoming.length}</p>
                  <p className="text-sm mt-1 font-bold text-primary-600 group-hover:text-primary-700">View all &rarr;</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('Prescriptions')}>
                <div className="flex items-center space-x-3 mb-3">
                  <Pill className="text-primary-600" size={20} />
                  <h3 className="font-bold text-sm text-slate-500">Active prescriptions</h3>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{prescriptions.length}</p>
                  <p className="text-sm mt-1 font-bold text-primary-600 group-hover:text-primary-700">View all &rarr;</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('Medical Records')}>
                <div className="flex items-center space-x-3 mb-3">
                  <FolderHeart className="text-primary-600" size={20} />
                  <h3 className="font-bold text-sm text-slate-500">Medical records</h3>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{records.length}</p>
                  <p className="text-sm mt-1 font-bold text-primary-600 group-hover:text-primary-700">Upload record &rarr;</p>
                </div>
              </div>

              <NextAppointmentCard appointment={nextAppt} />
            </div>

            {/* Row 3 — 60/40 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left (60%): Upcoming Appointment Card */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Appointment</h3>
                {nextAppt ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-primary-100 text-primary-700 font-bold text-lg rounded-full flex items-center justify-center shrink-0">
                        {nextAppt.doctorId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">Dr. {nextAppt.doctorId?.name}</p>
                        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">{nextAppt.doctorId?.specialty || 'Doctor'}</p>
                        <p className="text-sm text-slate-500 font-medium">{new Date(nextAppt.appointmentDate).toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end w-full sm:w-auto space-y-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${nextAppt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {nextAppt.status}
                      </span>
                      <button disabled className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-400 font-bold rounded-lg text-sm cursor-not-allowed">
                        Join Call
                      </button>
                      <button onClick={() => handleCancelAppointment(nextAppt._id)} className="text-xs text-rose-500 hover:text-rose-600 font-semibold underline">
                        Cancel appointment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center flex-1">
                    <Calendar size={32} className="text-slate-400 mb-3" />
                    <p className="text-sm text-slate-500 mb-4">You have no upcoming consultations.</p>
                    <button onClick={() => navigate('/doctors')} className="text-sm font-bold text-primary-600 hover:text-primary-700">Book your first consultation &rarr;</button>
                  </div>
                )}
              </div>

              {/* Right (40%): AI Quick Check Panel */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BrainCircuit size={20} className="text-primary-600" />
                    <h3 className="text-lg font-bold text-slate-800">Last AI check</h3>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium mb-2">No recent check</p>
                    <button onClick={() => navigate('/ai-symptom-checker')} className="text-sm font-bold text-primary-600 hover:text-primary-700">
                      Try the symptom checker &rarr;
                    </button>
                  </div>
                </div>
                <button onClick={() => navigate('/ai-symptom-checker')} className="mt-4 w-full py-3 bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 font-bold rounded-xl transition">
                  Run new check &rarr;
                </button>
              </div>
            </div>

            {/* Row 4 — Health Journey Timeline Component */}
            <HealthJourneyTimeline appointments={appointments} />

            {/* Row 5 — AI Symptom Checker Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-md mt-4">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="space-y-2 w-full md:w-auto relative z-10">
                <div className="flex items-center space-x-2 text-white font-black text-lg tracking-wide uppercase">
                  <BrainCircuit size={20} className="text-teal-300" />
                  <span>AI Symptom Checker</span>
                </div>
                <p className="text-primary-100 font-medium text-sm max-w-md">Describe your symptoms and get possible conditions instantly using our advanced AI.</p>
              </div>
              <div className="w-full md:w-auto shrink-0 relative z-10">
                 <button onClick={() => navigate('/ai-symptom-checker')} className="bg-white hover:bg-slate-50 text-primary-800 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 uppercase tracking-wide text-sm">
                   <span>Analyse Symptoms &rarr;</span>
                 </button>
              </div>
            </div>
            
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Local Topbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 text-primary-600">
          <Stethoscope className="h-6 w-6" />
          <span className="font-black text-lg tracking-tight text-slate-800">ASISHCARE</span>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-slate-400 hover:text-primary-600 relative transition">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('Settings')}>
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary-200 transition" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs ring-2 ring-transparent group-hover:ring-primary-200 transition">
                {user?.name?.charAt(0)}
              </div>
            )}
            <span className="text-sm font-bold text-slate-700 hidden sm:block group-hover:text-primary-600 transition">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Green Sidebar Area */}
        <div className="w-full md:w-64 bg-primary-600 text-white flex-shrink-0 flex flex-col border-r border-primary-700 z-10 relative py-6 shadow-xl overflow-y-auto custom-scrollbar">
          
          {/* Navigation Links */}
          <div className="flex-1 space-y-1.5 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name && !link.path; 
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white text-primary-700 shadow-sm' 
                      : 'text-primary-100 hover:bg-primary-500 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-primary-600' : 'text-primary-200'}`} />
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="px-4 mt-6 space-y-1.5 border-t border-primary-500 pt-6">
            <button 
              onClick={() => setActiveTab('Settings')}
              className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'Settings' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-primary-100 hover:bg-primary-500 hover:text-white'
              }`}
            >
              <Settings size={18} className={`mr-3 ${activeTab === 'Settings' ? 'text-primary-600' : 'text-primary-200'}`} />
              Settings
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-primary-100 hover:bg-rose-500 hover:text-white transition-colors group"
            >
              <LogOut size={18} className="mr-3 text-primary-200 group-hover:text-white" />
              Log out
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto w-full bg-slate-50 relative custom-scrollbar">
          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

          {/* Dynamic Tab Content */}
          {renderTabContent()}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
