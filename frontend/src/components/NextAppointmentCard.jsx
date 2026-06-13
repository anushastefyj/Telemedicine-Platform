import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NextAppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('far'); // far, near-24h, near-1h, now

  useEffect(() => {
    if (!appointment) return;

    const targetDate = new Date(appointment.appointmentDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('Started');
        setStatus('now');
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Pad with zero
      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      const ss = seconds.toString().padStart(2, '0');

      if (diff > 1000 * 60 * 60 * 24) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeLeft(`${days}d ${hh}h`);
        setStatus('far');
      } else {
        setTimeLeft(`${hh}:${mm}:${ss}`);
        if (diff <= 1000 * 60 * 15) {
          setStatus('now');
        } else if (diff <= 1000 * 60 * 60) {
          setStatus('near-1h');
        } else {
          setStatus('near-24h');
        }
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [appointment]);

  if (!appointment) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-600 transition">
        <div className="flex items-center space-x-3 mb-2">
          <Clock className="text-slate-400" size={20} />
          <h3 className="text-slate-500 font-bold text-sm">Next appointment</h3>
        </div>
        <p className="text-xl font-bold text-slate-800">None scheduled</p>
      </div>
    );
  }

  // Dynamic Styles
  let bgClass = "bg-white border border-slate-200";
  let textClass = "text-slate-800";
  let iconClass = "text-primary-600";
  
  if (status === 'near-24h') {
    bgClass = "bg-amber-50 border border-amber-200";
    iconClass = "text-amber-500";
  } else if (status === 'near-1h') {
    bgClass = "bg-green-50 border border-green-200";
    iconClass = "text-green-600";
  } else if (status === 'now') {
    bgClass = "bg-primary-600 border border-primary-600 shadow-md";
    textClass = "text-white";
    iconClass = "text-white";
  }

  return (
    <div className={`${bgClass} rounded-xl p-5 hover:border-primary-600 transition flex flex-col justify-between h-full relative overflow-hidden group`}>
      <div className="flex items-center space-x-3 mb-3">
        <Clock className={iconClass} size={20} />
        <h3 className={`font-bold text-sm ${status === 'now' ? 'text-primary-100' : 'text-slate-500'}`}>Next appointment</h3>
      </div>
      
      <div>
        <p className={`text-3xl font-black tracking-tight ${textClass}`}>{timeLeft}</p>
        <p className={`text-sm mt-1 font-medium ${status === 'now' ? 'text-primary-100' : 'text-slate-500'} truncate`}>
          Dr. {appointment.doctorId?.name || 'Unknown'} · {new Date(appointment.appointmentDate).toLocaleDateString()}
        </p>
      </div>

      {status === 'near-1h' && (
        <span className="absolute top-5 right-5 bg-green-200 text-green-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
          Join Soon
        </span>
      )}

      {status === 'now' && (
        <button 
          onClick={() => navigate('/video-call/' + appointment.videoCallId)}
          className="absolute top-5 right-5 bg-white text-primary-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-transform"
        >
          Join Now
        </button>
      )}
    </div>
  );
};

export default NextAppointmentCard;
