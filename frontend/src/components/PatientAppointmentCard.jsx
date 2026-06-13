import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientAppointmentCard = ({ appointment, onCancel, setActiveTab }) => {
  const navigate = useNavigate();
  const [isJoinable, setIsJoinable] = useState(false);

  useEffect(() => {
    if (appointment.status !== 'confirmed') return;
    
    const checkJoinable = () => {
      const now = new Date().getTime();
      const target = new Date(appointment.appointmentDate).getTime();
      const diff = target - now;
      // Joinable if within 15 mins (15 * 60 * 1000) or already started
      setIsJoinable(diff <= 900000);
    };

    checkJoinable();
    const interval = setInterval(checkJoinable, 60000);
    return () => clearInterval(interval);
  }, [appointment]);

  const isPast = ['completed', 'cancelled'].includes(appointment.status);
  
  // Left border color logic
  let borderLeftColor = 'border-primary-600';
  if (appointment.status === 'completed') borderLeftColor = 'border-slate-300';
  if (appointment.status === 'cancelled') borderLeftColor = 'border-rose-400';

  const formattedDate = new Date(appointment.appointmentDate).toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${borderLeftColor} rounded-xl p-5 shadow-sm flex flex-col`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Left Side: Avatar + Details */}
        <div className="flex items-center space-x-4">
          {appointment.doctorId?.profilePic ? (
             <img src={appointment.doctorId.profilePic} alt="Doctor" className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100" />
          ) : (
             <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0
               ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-700'}`}>
               {appointment.doctorId?.name?.charAt(0) || 'D'}
             </div>
          )}
          
          <div>
            <p className="font-bold text-slate-900 text-base leading-tight">Dr. {appointment.doctorId?.name || 'Unknown'}</p>
            <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mt-1 mb-1">{appointment.doctorId?.specialty || 'General'}</p>
            <p className="text-sm text-slate-500 font-medium">{formattedDate}</p>
          </div>
        </div>

        {/* Right Side: Status + Action */}
        <div className="flex flex-col items-end space-y-3 w-full sm:w-auto mt-2 sm:mt-0">
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider 
            ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
            ${appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
            ${appointment.status === 'completed' ? 'bg-slate-100 text-slate-700' : ''}
            ${appointment.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : ''}
          `}>
            {appointment.status}
          </span>

          {!isPast ? (
            <button 
              disabled={!isJoinable || appointment.status !== 'confirmed'}
              onClick={() => navigate('/video-call/' + appointment.videoCallId)}
              className={`w-full sm:w-auto px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm
                ${isJoinable && appointment.status === 'confirmed' 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Join Call
            </button>
          ) : (
             <div className="flex items-center space-x-2">
               {appointment.prescriptionId && (
                 <button onClick={() => setActiveTab && setActiveTab('prescriptions')} className="px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 font-bold rounded-lg text-sm transition">
                   View Prescription
                 </button>
               )}
               <button onClick={() => setActiveTab && setActiveTab('find-doctors')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-sm transition shadow-sm">
                 Book Follow-up
               </button>
             </div>
          )}
        </div>
      </div>

      {/* Bottom Row Links */}
      {!isPast && (
        <div className="flex items-center space-x-4 mt-5 pt-4 border-t border-slate-100">
          <button 
            onClick={() => onCancel && onCancel(appointment._id)} 
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline"
          >
            Cancel appointment
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('find-doctors')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline"
          >
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentCard;
