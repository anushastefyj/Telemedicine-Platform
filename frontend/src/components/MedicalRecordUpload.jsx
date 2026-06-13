import React, { useState } from 'react';
import { Upload, FileText, Image, X, AlertCircle } from 'lucide-react';
import { uploadRecordAPI } from '../services/api';

const MedicalRecordUpload = ({ appointments, onSuccess, onError }) => {
  const [file, setFile]               = useState(null);
  const [appointmentId, setApptId]    = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);

  const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

  const handleFile = (f) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      onError('Only PDF, JPEG, PNG, and WEBP files are accepted.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      onError('File must be smaller than 10 MB.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)          { onError('Please select a file to upload.'); return; }
    if (!appointmentId) { onError('Please select the related appointment.'); return; }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', appointmentId);
    if (description.trim()) formData.append('description', description.trim());

    setUploading(true);
    try {
      const res = await uploadRecordAPI(formData);
      if (res.success) {
        setFile(null);
        setApptId('');
        setDescription('');
        onSuccess(res.data);
      } else {
        onError(res.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      onError(err?.response?.data?.message || 'Upload failed. Please check the file and try again.');
    } finally {
      setUploading(false);
    }
  };

  const upcomingAppts = appointments.filter((a) =>
    ['confirmed', 'completed', 'pending'].includes(a.status)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-5"
    >
      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
        <Upload size={16} className="text-indigo-500" /> Upload Medical Record
      </h3>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => handleFile(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          id="record-file-input"
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            {file.type === 'application/pdf'
              ? <FileText size={24} className="text-red-400" />
              : <Image size={24} className="text-sky-400" />
            }
            <div className="text-left">
              <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-2 text-slate-400 hover:text-red-500 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Drag & drop or click to select</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPEG, PNG, WEBP · Max 10 MB</p>
          </>
        )}
      </div>

      {/* Appointment selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Related Appointment <span className="text-red-500">*</span>
        </label>
        <select
          value={appointmentId}
          onChange={(e) => setApptId(e.target.value)}
          required
          className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">-- Select an appointment --</option>
          {upcomingAppts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.doctorId?.name || 'Doctor'} · {a.date ? new Date(a.date).toLocaleDateString() : '—'} · {a.time}
            </option>
          ))}
          {upcomingAppts.length === 0 && (
            <option disabled>No appointments found</option>
          )}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="e.g. Blood test results from June checkup…"
          className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
        <AlertCircle size={13} className="shrink-0 mt-0.5 text-slate-400" />
        <span>Records are stored securely on Cloudinary. Only you and your treating doctor can access them.</span>
      </div>

      <button
        type="submit"
        disabled={uploading || !file || !appointmentId}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
      >
        {uploading ? (
          <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> Uploading…</>
        ) : (
          <><Upload size={14} /> Upload Record</>
        )}
      </button>
    </form>
  );
};

export default MedicalRecordUpload;
