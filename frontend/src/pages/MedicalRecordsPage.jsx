import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Download, Trash2, Upload, Filter,
  Eye, Calendar, Image, File, AlertCircle, RefreshCw, FolderHeart, Activity, Brain, Bone, Droplet
} from 'lucide-react';
import { getPatientRecordsAPI, deleteRecordAPI, getAppointmentsAPI } from '../services/api';
import MedicalRecordUpload from '../components/MedicalRecordUpload';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';

/* ───── helpers ───── */
const getFolderTheme = (record) => {
  const text = (record.fileName + " " + (record.description || '')).toLowerCase();
  if (text.includes('heart') || text.includes('cardio') || text.includes('ecg')) {
    return { bg: 'bg-rose-500', icon: <Activity size={32} className="text-white" />, label: 'Cardiology' };
  } else if (text.includes('brain') || text.includes('neuro') || text.includes('mri')) {
    return { bg: 'bg-purple-500', icon: <Brain size={32} className="text-white" />, label: 'Neurology' };
  } else if (text.includes('bone') || text.includes('xray') || text.includes('ortho')) {
    return { bg: 'bg-orange-500', icon: <Bone size={32} className="text-white" />, label: 'Orthopedics' };
  } else if (text.includes('blood') || text.includes('lab')) {
    return { bg: 'bg-red-500', icon: <Droplet size={32} className="text-white" />, label: 'Lab Report' };
  }
  return { bg: 'bg-primary-600', icon: <FolderHeart size={32} className="text-white" />, label: 'General' };
};

const RecordCard = ({ record, canDelete, onDelete, onViewReport }) => {
  const isFormReport = !record.fileUrl;
  const displayName = record.fileName || 'Doctor Report';
  const theme = isFormReport 
    ? { bg: 'bg-indigo-500', icon: <FileText size={32} className="text-white" />, label: 'Doctor Report' }
    : getFolderTheme({ ...record, fileName: displayName });

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200">
      {/* Top Half: Folder Color */}
      <div className={`h-28 ${theme.bg} relative flex flex-col items-center justify-center transition-colors`}>
        {theme.icon}
        <span className="absolute bottom-2 right-3 text-white/90 text-[10px] font-bold uppercase tracking-wider">{theme.label}</span>
      </div>
      
      {/* Bottom Half: Details */}
      <div className="p-4 flex flex-col flex-1 relative bg-white">
        {canDelete && (
          <button 
            onClick={() => onDelete(record._id, displayName)}
            className="absolute -top-4 right-3 bg-white p-1.5 rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors z-10"
            title="Delete record"
          >
            <Trash2 size={14} />
          </button>
        )}
        <h4 className="font-bold text-slate-800 text-sm mb-1 truncate pr-6" title={displayName}>{displayName}</h4>
        <p className="text-xs font-semibold text-slate-500 mb-4">{new Date(record.createdAt).toLocaleDateString()}</p>
        
        <div className="mt-auto flex items-center justify-between gap-2">
           {isFormReport ? (
             <button onClick={() => onViewReport(record)} className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
               <Eye size={14} /> View Report
             </button>
           ) : (
             <>
               <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                 <Eye size={14} /> View
               </a>
               <a href={record.fileUrl} download={record.fileName} className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                 <Download size={14} /> Save
               </a>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords]           = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [showUpload, setShowUpload]     = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  /* filters */
  const [typeFilter, setTypeFilter]   = useState('all');
  const [dateFilter, setDateFilter]   = useState('');

  const canDelete = user?.role === 'doctor' || user?.role === 'admin';

  const fetchRecords = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const patientId = user.role === 'patient' ? user._id : user._id;
      const [recRes, appRes] = await Promise.all([
        getPatientRecordsAPI(patientId),
        getAppointmentsAPI(),
      ]);
      if (recRes.success) setRecords(recRes.data);
      if (appRes.success) setAppointments(appRes.data);
    } catch {
      setError('Failed to load medical records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await deleteRecordAPI(id);
      if (res.success) {
        setSuccess('Record deleted successfully.');
        setRecords((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      setError('Failed to delete record.');
    }
  };

  /* apply filters */
  const filtered = records.filter((r) => {
    const isForm = !r.fileUrl;
    const rType = isForm ? 'form' : r.fileType;
    const matchType = typeFilter === 'all' || rType === typeFilter;
    const matchDate = !dateFilter || r.createdAt?.startsWith(dateFilter);
    return matchType && matchDate;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-1">View, upload and manage your health documents</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchRecords}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:border-primary-300 transition font-bold"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowUpload((v) => !v)}
            className="flex items-center gap-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-xl px-4 py-2 font-bold shadow-sm transition"
          >
            <Upload size={14} /> {showUpload ? 'Close Upload' : 'Upload Record'}
          </button>
        </div>
      </div>

      <Alert type="error"   message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Upload panel */}
      {showUpload && (
        <MedicalRecordUpload
          appointments={appointments}
          onSuccess={(rec) => {
            setRecords((prev) => [rec, ...prev]);
            setSuccess('Record uploaded successfully!');
            setShowUpload(false);
          }}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <Filter size={15} className="text-slate-400" />
        <span className="text-sm text-slate-500 font-medium">Filters:</span>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF Only</option>
          <option value="image">Images Only</option>
          <option value="form">Doctor Reports</option>
        </select>
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        {(typeFilter !== 'all' || dateFilter) && (
          <button
            onClick={() => { setTypeFilter('all'); setDateFilter(''); }}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Records list */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-8">
          <FolderHeart size={40} className="text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No medical records</h3>
          <p className="text-sm text-slate-500 mb-4">
            {records.length === 0 ? 'You haven\'t uploaded any medical documents yet.' : 'Try adjusting your filters.'}
          </p>
          {records.length === 0 && (
            <button onClick={() => setShowUpload(true)} className="text-sm font-bold text-primary-600 hover:text-primary-700 transition">
              Upload your first record &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((record) => (
            <RecordCard
              key={record._id}
              record={record}
              canDelete={canDelete}
              onDelete={handleDelete}
              onViewReport={setSelectedReport}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Notice:</strong> Your medical records are private and only accessible to you and your treating physicians.
          All files are securely stored and transmitted using encrypted connections.
        </p>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Medical Report</h3>
                  <p className="text-xs text-slate-500">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {selectedReport.symptoms && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">Symptoms</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedReport.symptoms}</p>
                </div>
              )}
              {selectedReport.diagnosis && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">Diagnosis</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedReport.diagnosis}</p>
                </div>
              )}
              {selectedReport.treatmentPlan && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">Treatment Plan</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedReport.treatmentPlan}</p>
                </div>
              )}
              {selectedReport.notes && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">Additional Notes</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedReport.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
