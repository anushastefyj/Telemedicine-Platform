import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, FileText, Check, X, CreditCard } from 'lucide-react';

const AppointmentCard = ({ appointment, role, onCancel, onConfirm, onComplete }) => {
  const {
    _id,
    date,
    time,
    status,
    reason,
    symptoms,
    videoCallId,
    paymentStatus,
    prescriptionId,
    patientId,
    doctorId,
  } = appointment;

  // format date beautifully
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-sky-50 text-sky-700 border-sky-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const payStyles = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-rose-100 text-rose-800',
  };

  // Determine user to show info for
  const counterpart = role === 'doctor' ? patientId : doctorId;
  const name = counterpart?.name || 'User';
  const subtext = role === 'doctor' ? counterpart?.email : counterpart?.specialty;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 mb-4 gap-2">
        <div className="flex items-center space-x-3">
          {counterpart?.profilePic ? (
            <img
              src={counterpart.profilePic}
              alt={name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-900">
              {role === 'doctor' ? 'Patient: ' : 'Dr. '}{name}
            </h4>
            <p className="text-xs text-slate-500">{subtext}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[status]}`}>
            {status.toUpperCase()}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payStyles[paymentStatus]}`}>
            {paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
          </span>
        </div>
      </div>

      {/* Appointment Time/Info details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center">
            <Calendar size={16} className="text-slate-400 mr-2" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="text-slate-400 mr-2" />
            <span>{time} ({appointment.duration || 30} mins)</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-slate-500 font-semibold mb-0.5">Reason for Visit:</p>
          <p className="text-slate-700 italic">"{reason}"</p>
          {symptoms && (
            <p className="text-slate-500 mt-1">
              <span className="font-semibold">Symptoms:</span> {symptoms}
            </p>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
        {/* Join video call button */}
        {status === 'confirmed' && videoCallId && (
          <Link
            to={`/video-call/${videoCallId}`}
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <Video size={14} />
            <span>Join Consult</span>
          </Link>
        )}

        {/* View/Add prescription buttons */}
        {prescriptionId ? (
          <Link
            to={`/prescriptions/appointment/${_id}`}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium text-xs rounded-xl transition"
          >
            <FileText size={14} />
            <span>View Prescription</span>
          </Link>
        ) : (
          role === 'doctor' &&
          status === 'completed' && (
            <Link
              to={`/appointments/${_id}`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium text-xs rounded-xl transition"
            >
              <FileText size={14} />
              <span>Write Prescription</span>
            </Link>
          )
        )}

        {/* Patient Review action */}
        {role === 'patient' && status === 'completed' && (
          <Link
            to={`/appointments/${_id}`}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs rounded-xl transition"
          >
            Leave Review
          </Link>
        )}

        {/* Pay Now Button */}
        {role === 'patient' && paymentStatus === 'pending' && status !== 'cancelled' && (
          <Link
            to={`/appointments/${_id}`}
            className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs rounded-xl shadow-sm transition"
          >
            <CreditCard size={14} />
            <span>Pay Now</span>
          </Link>
        )}

        {/* Doctor State Transitions */}
        {role === 'doctor' && status === 'pending' && onConfirm && (
          <button
            onClick={() => onConfirm(_id)}
            className="flex items-center space-x-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl transition"
          >
            <Check size={14} />
            <span>Confirm</span>
          </button>
        )}

        {role === 'doctor' && status === 'confirmed' && onComplete && (
          <button
            onClick={() => onComplete(_id)}
            className="flex items-center space-x-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-xl transition"
          >
            <Check size={14} />
            <span>Complete</span>
          </button>
        )}

        {/* Cancel button */}
        {['pending', 'confirmed'].includes(status) && onCancel && (
          <button
            onClick={() => onCancel(_id)}
            className="flex items-center space-x-1 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-xs rounded-xl ml-auto transition"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        )}

        <Link
          to={`/appointments/${_id}`}
          className="ml-auto text-xs font-semibold text-slate-400 hover:text-slate-600 transition p-2"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default AppointmentCard;
