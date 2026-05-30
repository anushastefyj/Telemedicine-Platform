import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentsAPI, cancelAppointmentAPI, getPrescriptionsByPatientAPI } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import PrescriptionCard from '../components/PrescriptionCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { Calendar, FileText, Activity } from 'lucide-react';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your virtual visits and prescriptions</p>
      </div>

      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Upcoming and Past appointments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming visits */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <Calendar className="text-slate-400 mr-2" size={16} />
              <span>Upcoming Consultations ({upcoming.length})</span>
            </h3>

            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((app) => (
                  <AppointmentCard
                    key={app._id}
                    appointment={app}
                    role="patient"
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No upcoming consultations scheduled.
              </div>
            )}
          </div>

          {/* Past visits */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <Activity className="text-slate-400 mr-2" size={16} />
              <span>Past Visits ({past.length})</span>
            </h3>

            {past.length > 0 ? (
              <div className="space-y-4">
                {past.map((app) => (
                  <AppointmentCard
                    key={app._id}
                    appointment={app}
                    role="patient"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No history of previous consultations.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Prescriptions list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center">
            <FileText className="text-slate-400 mr-2" size={16} />
            <span>Prescriptions ({prescriptions.length})</span>
          </h3>

          {prescriptions.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {prescriptions.map((pres) => (
                <PrescriptionCard key={pres._id} prescription={pres} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No prescriptions issued yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
