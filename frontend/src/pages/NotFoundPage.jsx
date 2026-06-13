import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Stethoscope, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Big 404 */}
        <div className="relative">
          <p className="text-[9rem] sm:text-[12rem] font-extrabold text-slate-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-slate-100">
              <Stethoscope size={40} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800">Page Not Found</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm border-[1.5px] border-slate-300 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition"
          >
            <Home size={14} /> Home
          </Link>
          <Link
            to="/doctors"
            className="inline-flex items-center justify-center gap-2 bg-white border-[1.5px] border-primary-600 text-primary-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition"
          >
            <Stethoscope size={14} /> Find a Doctor
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          If you believe this is an error, please{' '}
          <a href="mailto:support@asishcare.com" className="text-primary-500 hover:underline">contact support</a>.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
