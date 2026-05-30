import React from 'react';
import { Pill, AlertCircle, FileText } from 'lucide-react';

const PrescriptionCard = ({ prescription }) => {
  const { medications, instructions, notes, createdAt, doctorId } = prescription;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
      <div className="flex items-center space-x-3 pb-4 border-b border-teal-50 mb-4">
        <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">Medical Prescription</h4>
          <p className="text-xs text-slate-400">Issued on {formattedDate}</p>
        </div>
        {doctorId && (
          <div className="ml-auto text-right text-xs">
            <span className="text-slate-400 block">Prescribing Doctor</span>
            <span className="font-semibold text-slate-700">Dr. {doctorId.name}</span>
          </div>
        )}
      </div>

      <h5 className="font-semibold text-slate-800 text-sm mb-3">Medication Details:</h5>
      <div className="divide-y divide-slate-100 mb-4">
        {medications && medications.map((med, index) => (
          <div key={index} className="py-3 flex items-start space-x-3">
            <Pill className="text-teal-500 mt-1" size={16} />
            <div>
              <span className="font-semibold text-slate-800 block text-sm">{med.name}</span>
              <span className="text-xs text-slate-500">
                Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
              </span>
            </div>
          </div>
        ))}
      </div>

      {instructions && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-2">
          <span className="font-semibold text-slate-800 block text-xs mb-1">Instructions:</span>
          <p className="text-xs text-slate-600 leading-relaxed">{instructions}</p>
        </div>
      )}

      {notes && (
        <div className="flex items-start space-x-2 text-xs text-slate-500 p-1">
          <AlertCircle size={14} className="text-slate-400 mt-0.5" />
          <span>Note: {notes}</span>
        </div>
      )}
    </div>
  );
};

export default PrescriptionCard;
