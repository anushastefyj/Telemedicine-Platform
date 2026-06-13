import React from 'react';
import AppointmentCard from './AppointmentCard';
import { Calendar, DollarSign, Users, Clock, AlertCircle } from 'lucide-react';

export const OverviewTab = ({ appointments, activeAppointments, completedCount, totalEarnings, handleConfirm, handleComplete, handleCancel }) => (
  <div className="fade-in space-y-8 max-w-6xl pb-10">
    <div className="flex flex-col">
      <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Doctor Dashboard</h1>
      <p className="text-[14px] text-slate-500 mt-1">Review clinical consult queues and patient logs</p>
    </div>

    {/* Metrics Row */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-primary-600 transition">
        <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <Calendar size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Active Consults</span>
          <span className="text-2xl font-black text-slate-900">{activeAppointments.length}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-primary-600 transition">
        <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Users size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Completed Consults</span>
          <span className="text-2xl font-black text-slate-900">{completedCount}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-primary-600 transition">
        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Gross Earnings</span>
          <span className="text-2xl font-black text-slate-900">${totalEarnings}</span>
        </div>
      </div>
    </div>

    {/* Queue Lists */}
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <h3 className="font-bold text-slate-800 text-lg pb-4 border-b border-slate-100">
        Patient Appointment Queue
      </h3>

      {activeAppointments.length > 0 ? (
        <div className="space-y-6">
          {activeAppointments.map((app) => (
            <AppointmentCard
              key={app._id}
              appointment={app}
              role="doctor"
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center">
          <Clock size={40} className="text-slate-300 mb-4" />
          <p>No active patient appointments in the queue.</p>
        </div>
      )}
    </div>
  </div>
);

export const AppointmentsTab = ({ appointments, handleConfirm, handleComplete, handleCancel }) => (
  <div className="fade-in space-y-8 max-w-4xl pb-10">
    <div className="flex flex-col">
      <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">All Appointments</h1>
      <p className="text-[14px] text-slate-500 mt-1">Manage all your scheduled and past consultations.</p>
    </div>
    
    <div className="space-y-6">
      {appointments.length > 0 ? (
        appointments.map((app) => (
          <AppointmentCard
            key={app._id}
            appointment={app}
            role="doctor"
            onConfirm={handleConfirm}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ))
      ) : (
        <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center bg-white border border-slate-200 rounded-3xl">
          <Calendar size={40} className="text-slate-300 mb-4" />
          <p>No appointments found.</p>
        </div>
      )}
    </div>
  </div>
);

import { getDoctorPrescriptionsAPI } from '../services/api';
import PrescriptionCard from './PrescriptionCard';
import LoadingSpinner from './Common/LoadingSpinner';

export const PatientsTab = () => {
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await getDoctorPrescriptionsAPI();
        if (res.success) {
          setPrescriptions(res.data);
        }
      } catch (err) {
        console.error("Failed to load doctor prescriptions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <LoadingSpinner fullPage={false} />;

  return (
    <div className="fade-in space-y-8 max-w-4xl pb-10">
      <div className="flex flex-col">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Patient Adherence Monitor</h1>
        <p className="text-[14px] text-slate-500 mt-1">Track medication compliance across all your patients.</p>
      </div>

      <div className="space-y-6">
        {prescriptions.length > 0 ? (
          prescriptions.map(pres => (
            <div key={pres._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
                {pres.patientId?.profilePic ? (
                  <img src={pres.patientId.profilePic} alt="Patient" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {pres.patientId?.name?.charAt(0) || 'P'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pres.patientId?.name}</h3>
                  <p className="text-sm text-slate-500">{pres.patientId?.email}</p>
                </div>
              </div>
              <PrescriptionCard prescription={pres} role="doctor" />
            </div>
          ))
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Users size={40} className="text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Patients</h3>
            <p className="text-sm text-slate-500">You haven't issued any prescriptions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const EarningsTab = () => (
  <div className="fade-in space-y-8 max-w-4xl pb-10">
    <div className="flex flex-col">
      <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Earnings & Payouts</h1>
      <p className="text-[14px] text-slate-500 mt-1">Track your financial performance.</p>
    </div>
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
      <DollarSign size={40} className="text-slate-400 mb-4" />
      <h3 className="text-lg font-bold text-slate-800 mb-1">Earnings Module</h3>
      <p className="text-sm text-slate-500">This feature will be available in the next release.</p>
    </div>
  </div>
);
