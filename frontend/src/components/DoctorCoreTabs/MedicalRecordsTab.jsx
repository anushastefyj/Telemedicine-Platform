import React, { useState } from 'react';
import { createReportRecordAPI } from '../../services/api';
import Alert from '../Common/Alert';
import { FileText, Save, User } from 'lucide-react';

const MedicalRecordsTab = ({ appointments }) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter out duplicate patients, just keep one appointment per patient for simplicity, or allow selecting any appointment.
  const pastAppointments = appointments.filter(app => app.status === 'completed' || app.status === 'confirmed');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      setErrorMsg('Please select a patient / appointment.');
      return;
    }

    const appointment = pastAppointments.find(app => app._id === selectedAppointmentId);
    if (!appointment) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await createReportRecordAPI({
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        ...formData
      });
      if (res.success) {
        setSuccessMsg('Medical report created and sent to patient successfully!');
        setFormData({ symptoms: '', diagnosis: '', treatmentPlan: '', notes: '' });
        setSelectedAppointmentId('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create medical report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 bg-primary-50 rounded-xl">
            <FileText className="text-primary-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create Medical Report</h2>
            <p className="text-sm text-slate-500">Fill out the patient's medical details. This will be visible on their dashboard.</p>
          </div>
        </div>

        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <User size={16} className="mr-2 text-slate-400" />
              Select Patient (Appointment)
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            >
              <option value="">-- Select --</option>
              {pastAppointments.map(app => (
                <option key={app._id} value={app._id}>
                  {app.patientId?.name || 'Unknown'} - {new Date(app.appointmentDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all custom-scrollbar"
                placeholder="e.g., Fever, cough, fatigue..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all custom-scrollbar"
                placeholder="e.g., Viral infection..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Treatment Plan</label>
            <textarea
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all custom-scrollbar"
              placeholder="e.g., Rest, hydration, prescribed medications..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all custom-scrollbar"
              placeholder="Any other observations..."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Save & Publish Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalRecordsTab;
