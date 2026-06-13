import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import Alert from '../components/Common/Alert';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    const res = await login(data);
    setLoading(false);

    if (res.success) {
      // Role-based redirection instead of manual routing
      const role = res.user?.role || 'patient';
      const roleDashboardMap = {
        patient: '/dashboard/patient',
        doctor: '/dashboard/doctor',
        admin: '/dashboard/admin'
      };
      
      const targetRoute = roleDashboardMap[role] || '/dashboard/patient';
      
      // If they were trying to access a specific nested page, we can honor it, 
      // otherwise send them to their dedicated dashboard
      const finalRoute = (from !== '/' && from !== '/login') ? from : targetRoute;
      
      navigate(finalRoute, { replace: true });
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c8a52] p-4 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-md relative flex items-center justify-center z-10">

          
          <div className="bg-slate-50 w-full max-w-md rounded-[2rem] p-12 shadow-soft text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-wider mb-8 uppercase">Welcome!</h2>

            <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Username/Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Your username"
                  {...register('email', { required: 'Required' })}
                  className="w-full px-5 py-3.5 bg-slate-200 border-none rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium transition"
                />
                {errors.email && (
                  <span className="text-xs text-rose-500 font-medium block mt-1 text-left px-4">{errors.email.message}</span>
                )}
              </div>

              {/* Password Input */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  {...register('password', { required: 'Required' })}
                  className="w-full px-5 py-3.5 bg-slate-200 border-none rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium transition"
                />
                {errors.password && (
                  <span className="text-xs text-rose-500 font-medium block mt-1 text-left px-4">{errors.password.message}</span>
                )}
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-2.5 bg-[#2c8a52] hover:bg-[#1f663c] text-white font-bold rounded-lg transition disabled:opacity-50 text-sm shadow-md"
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Login'}
                </button>
              </div>

              {/* Checkbox & Forgot Password */}
              <div className="pt-4 flex flex-col items-center space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition">Remember Me</span>
                </label>
                
                <a href="#" className="text-xs text-slate-500 font-medium hover:text-primary-600 transition">
                  Forgot your password?
                </a>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6">
               <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-primary-600 hover:underline">
                    Create an account
                  </Link>
               </p>
            </div>

          </div>

        </div>

      </div>
  );
};

export default LoginPage;
