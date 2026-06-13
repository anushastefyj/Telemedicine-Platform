import React from 'react';
import { CalendarCheck, Pill, FolderHeart, Calendar, BrainCircuit } from 'lucide-react';
import NextAppointmentCard from './NextAppointmentCard';
import PatientAppointmentCard from './PatientAppointmentCard';
import PrescriptionCard from './PrescriptionCard';
import HealthJourneyTimeline from './HealthJourneyTimeline';

export const OverviewTab = ({ user, upcoming, prescriptions, records, nextAppt, setActiveTab, navigate, handleCancelAppointment }) => (
  <div className="fade-in max-w-6xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-10">
    <div className="flex flex-col">
      <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Good morning, {user?.name?.split(' ')[0]}</h1>
      <p className="text-[14px] text-slate-500 mt-1">Here's your health summary for today.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('appointments')}>
        <div className="flex items-center space-x-3 mb-3">
          <CalendarCheck className="text-primary-600" size={20} />
          <h3 className="font-bold text-sm text-slate-500">Upcoming appointments</h3>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{upcoming.length}</p>
          <p className="text-sm mt-1 font-bold text-primary-600 group-hover:text-primary-700">View all &rarr;</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('prescriptions')}>
        <div className="flex items-center space-x-3 mb-3">
          <Pill className="text-primary-600" size={20} />
          <h3 className="font-bold text-sm text-slate-500">Active prescriptions</h3>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{prescriptions.length}</p>
          <p className="text-sm mt-1 font-bold text-primary-600 group-hover:text-primary-700">View all &rarr;</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between group cursor-pointer shadow-sm" onClick={() => setActiveTab('records')}>
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

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
            <button onClick={() => setActiveTab('find-doctors')} className="text-sm font-bold text-primary-600 hover:text-primary-700">Book your first consultation &rarr;</button>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <BrainCircuit size={20} className="text-primary-600" />
            <h3 className="text-lg font-bold text-slate-800">Last AI check</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
            <p className="text-slate-500 text-sm font-medium mb-2">No recent check</p>
            <button onClick={() => setActiveTab('ai-checker')} className="text-sm font-bold text-primary-600 hover:text-primary-700">
              Try the symptom checker &rarr;
            </button>
          </div>
        </div>
        <button onClick={() => setActiveTab('ai-checker')} className="mt-4 w-full py-3 bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 font-bold rounded-xl transition">
          Run new check &rarr;
        </button>
      </div>
    </div>

    <HealthJourneyTimeline appointments={[...upcoming, ...records]} /> {/* Pass relevant data here */}

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
         <button onClick={() => setActiveTab('ai-checker')} className="bg-white hover:bg-slate-50 text-primary-800 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 uppercase tracking-wide text-sm">
           <span>Analyse Symptoms &rarr;</span>
         </button>
      </div>
    </div>
  </div>
);

export const AppointmentsTab = ({ apptTab, setApptTab, upcoming, past, setActiveTab, handleCancelAppointment }) => {
  const displayedAppts = apptTab === 'upcoming' ? upcoming : past;
  return (
    <div className="space-y-8 fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* The title is now in Topbar, so we can omit it here or keep it */}
        {/* <h2 className="text-3xl font-black text-slate-900 tracking-tight">All Appointments</h2> */}
        
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
          displayedAppts.map(app => <PatientAppointmentCard key={app._id} appointment={app} onCancel={handleCancelAppointment} setActiveTab={setActiveTab} />)
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
              <button onClick={() => setActiveTab('find-doctors')} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition">
                Book a consultation &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PrescriptionsTab = ({ prescriptions }) => (
  <div className="space-y-8 fade-in max-w-3xl">
    {/* Title omitted since it's in topbar */}
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
