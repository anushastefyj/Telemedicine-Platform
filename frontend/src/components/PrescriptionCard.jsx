import React, { useState } from 'react';
import { Pill, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { updateMedicationAdherenceAPI } from '../services/api';

const ProgressRing = ({ percentage, topText, bottomText }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="80" height="80" className="transform -rotate-90 drop-shadow-sm">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
        <circle 
          cx="40" cy="40" r={radius} 
          stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          className="text-primary-600 transition-all duration-1000 ease-out" 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[14px] font-black text-slate-800 leading-none">{topText}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{bottomText}</span>
      </div>
    </div>
  );
};

const MedicationAdherenceRow = ({ med, prescriptionId, role }) => {
  const [daysTaken, setDaysTaken] = useState(med.daysTaken || 0);
  const [loading, setLoading] = useState(false);
  
  // Extract number from "7 days" or default to 7
  const durationMatch = med.duration?.match(/\d+/);
  const totalDays = durationMatch ? parseInt(durationMatch[0]) : 7;
  
  const percentage = Math.min((daysTaken / totalDays) * 100, 100);
  const needsRefill = (totalDays - daysTaken) <= 2; // Warning if 2 or fewer days left
  const isCompleted = daysTaken >= totalDays;

  const handleMarkTaken = async () => {
    if (loading || isCompleted || role === 'doctor') return;
    setLoading(true);
    try {
      const res = await updateMedicationAdherenceAPI(prescriptionId, med._id);
      if (res.success) {
        setDaysTaken(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to update adherence', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-primary-300 transition-colors flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        
        {/* Left (30%): Progress Ring */}
        <div className="w-full sm:w-[30%] flex justify-center sm:justify-start items-center gap-4">
          <ProgressRing percentage={percentage} topText={`${daysTaken}/${totalDays}`} bottomText="Days" />
        </div>

        {/* Center (40%): Medicine Info */}
        <div className="w-full sm:w-[40%] text-center sm:text-left">
          <h4 className="text-lg font-bold text-slate-900 leading-tight">{med.name}</h4>
          <p className="text-primary-600 font-bold text-sm mt-0.5">{med.dosage}</p>
          <p className="text-slate-500 font-medium text-sm mt-1">{med.frequency}</p>
        </div>

        {/* Right (30%): Status / Refill Warning */}
        <div className="w-full sm:w-[30%] flex flex-col items-center sm:items-end justify-center space-y-2">
          {needsRefill ? (
             <div className="bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center">
               <AlertTriangle size={16} className="text-amber-600" />
               <span className="text-amber-800 font-bold text-xs uppercase tracking-wider">Low Supply</span>
             </div>
          ) : isCompleted ? (
             <div className="bg-green-100 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center">
               <Check size={16} className="text-green-600" />
               <span className="text-green-800 font-bold text-xs uppercase tracking-wider">Completed</span>
             </div>
          ) : (
             <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto justify-center">
               <Clock size={16} className="text-slate-500" />
               <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Active</span>
             </div>
          )}
        </div>
      </div>

      {/* Bottom: Actions (Only for Patient) */}
      {role !== 'doctor' && (
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 w-full">
          <button 
            onClick={handleMarkTaken}
            disabled={loading || isCompleted}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-2 flex items-center justify-center gap-2
              ${isCompleted 
                ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-600 hover:text-primary-600'}
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : isCompleted ? <Check size={16} /> : null}
            {isCompleted ? 'Course Completed' : 'Mark as Taken (Today)'}
          </button>
          <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl border-2 border-primary-600 transition-all text-sm shadow-sm flex items-center justify-center gap-2 group">
            <Pill size={16} className="text-primary-200 group-hover:text-white" />
            Order Refill
          </button>
        </div>
      )}
    </div>
  );
};

const PrescriptionCard = ({ prescription, role }) => {
  const { _id, medications, doctor, createdAt } = prescription;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 mb-8">
      {/* Header for Prescription */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Prescription from Dr. {doctor?.name || 'Doctor'}</h3>
          <p className="text-sm text-slate-500 font-medium">Issued on {formattedDate}</p>
        </div>
      </div>
      
      {/* Medication List */}
      <div className="space-y-4">
        {medications && medications.length > 0 ? (
          medications.map((med, index) => (
            <MedicationAdherenceRow key={index} med={med} prescriptionId={_id} role={role} />
          ))
        ) : (
          <p className="text-slate-400 text-sm">No medications listed.</p>
        )}
      </div>
    </div>
  );
};

export default PrescriptionCard;
