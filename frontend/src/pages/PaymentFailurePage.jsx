import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';

const PaymentFailurePage = () => {
  const [params] = useSearchParams();
  const appointmentId = params.get('appointmentId');
  const reason = params.get('reason') || 'Your payment could not be processed.';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error card */}
        <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-10 text-center">
          {/* Animated X */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle size={40} className="text-red-400" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Failed</h1>
          <p className="text-slate-500 text-sm mb-2 leading-relaxed">{reason}</p>
          <p className="text-xs text-slate-400 mb-6">
            No charge has been made to your account. Please try again or use a different payment method.
          </p>

          {/* Common reasons */}
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Common reasons for failure</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Insufficient funds or credit limit reached</li>
              <li>• Card details entered incorrectly</li>
              <li>• Card expired or not activated for online payments</li>
              <li>• Bank declined the transaction for security</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {appointmentId ? (
              <Link
                to={`/appointments/${appointmentId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition"
              >
                <RefreshCw size={14} /> Try Again
              </Link>
            ) : (
              <Link
                to="/doctors"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition"
              >
                <RefreshCw size={14} /> Book Again
              </Link>
            )}
            <Link
              to="/patient-dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-200 transition"
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
          </div>
        </div>

        {/* Help */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <HelpCircle size={13} className="text-slate-300" />
          <span>
            Need help?{' '}
            <a href="mailto:support@caresync.com" className="text-indigo-500 hover:underline">
              Contact support
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
