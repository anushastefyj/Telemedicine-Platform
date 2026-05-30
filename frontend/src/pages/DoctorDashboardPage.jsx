import React, { useState, useEffect } from 'react';
import { getMyDoctorAppointmentsAPI, confirmAppointmentAPI, completeAppointmentAPI, cancelAppointmentAPI } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { Calendar, DollarSign, Users, Award } from 'lucide-react';

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDoctorAppointments = async () => {
    try {
      const res = await getMyDoctorAppointmentsAPI();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load doctor dashboard appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

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

  // Group metrics
  const activeAppointments = appointments.filter((app) => ['pending', 'confirmed'].includes(app.status));
  const completedCount = appointments.filter((app) => app.status === 'completed').length;

  // Earnings calculations: completed and paid appointments
  const totalEarnings = appointments
    .filter((app) => app.status === 'completed' && app.paymentStatus === 'paid')
    .reduce((acc, current) => acc + (current.doctorId?.consultationFee || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Review clinical consult queues and patient logs</p>
      </div>

      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Active Consults</span>
            <span className="text-2xl font-black text-slate-900">{activeAppointments.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Completed Consults</span>
            <span className="text-2xl font-black text-slate-900">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
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
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 text-base pb-2 border-b border-slate-50">
          Patient Appointment Queue
        </h3>

        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((app) => (
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
          <div className="text-center py-12 text-slate-500 text-sm">
            No patient appointments scheduled.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
