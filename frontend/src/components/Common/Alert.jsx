import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 icon-emerald-500',
    error: 'bg-rose-50 text-rose-800 border-rose-200 icon-rose-500',
    info: 'bg-sky-50 text-sky-800 border-sky-200 icon-sky-500',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 mr-3" />,
    info: <Info className="h-5 w-5 text-sky-500 mr-3" />,
  };

  if (!message) return null;

  return (
    <div className={`flex items-start p-4 border rounded-xl fade-in mb-4 ${styles[type] || styles.info}`}>
      {icons[type] || icons.info}
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-slate-600 transition"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
