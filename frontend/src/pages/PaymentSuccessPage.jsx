import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { confirmPaymentAPI } from '../services/api';

const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const [status, setStatus]     = useState('loading'); // 'loading' | 'done' | 'error'
  const [appointment, setAppt]  = useState(null);

  const appointmentId = params.get('appointmentId');
  const paymentId     = params.get('paymentId') || `pi_mock_${Date.now()}`;

  useEffect(() => {
    if (!appointmentId) { setStatus('done'); return; }
    (async () => {
      try {
        const res = await confirmPaymentAPI({ appointmentId, paymentId });
        if (res.success) {
          setAppt(res.data);
          setStatus('done');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    })();
  }, [appointmentId, paymentId]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-600 font-medium">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Confirmation Failed</h2>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't confirm your payment. Your appointment may still be pending — please check your dashboard.
          </p>
          <Link
            to="/patient-dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition"
          >
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success card */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-10 text-center">
          {/* Animated checkmark */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 animate-[bounceIn_0.5s_ease-out]">
            <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your appointment has been confirmed. You'll receive a confirmation email shortly.
          </p>

          {/* Appointment summary */}
          {appointment && (
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Appointment Summary</p>
              {appointment.doctorId?.name && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Doctor</span>
                  <span className="font-semibold text-slate-800">{appointment.doctorId.name}</span>
                </div>
              )}
              {appointment.date && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(appointment.date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {appointment.time && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time</span>
                  <span className="font-semibold text-slate-800">{appointment.time}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-600 capitalize">{appointment.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="font-semibold text-emerald-600 capitalize">{appointment.paymentStatus}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/patient-dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition"
            >
              <Calendar size={14} /> My Dashboard
            </Link>
            <Link
              to="/doctors"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-200 transition"
            >
              Browse Doctors
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Having issues? Contact support at{' '}
          <a href="mailto:support@caresync.com" className="text-indigo-500 hover:underline">
            support@caresync.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
