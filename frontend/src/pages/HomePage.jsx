import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Activity, ArrowRight, Star } from 'lucide-react';
import Alert from '../components/Common/Alert';

const HomePage = () => {
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

  const from = location.state?.from?.pathname || '/patient-dashboard';

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    const res = await login(data);
    setLoading(false);

    if (res.success) {
      if (res.data.role === 'patient') navigate(from, { replace: true });
      if (res.data.role === 'doctor') navigate('/doctor-dashboard', { replace: true });
      if (res.data.role === 'admin') navigate('/admin-dashboard', { replace: true });
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-dark-900 text-white font-sans flex items-center pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Main Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Side: Hero */}
          <div className="space-y-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-white">
              Quality healthcare,<br />from anywhere
            </h1>
            
            <p className="text-dark-300 text-lg sm:text-xl max-w-lg leading-relaxed">
              Book verified doctors, get AI-powered symptom insights, and manage your health — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/doctors')}
                className="bg-transparent border border-dark-600 hover:border-dark-400 text-white font-medium px-8 py-3.5 rounded-xl transition duration-200"
              >
                Book a consultation
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 bg-transparent border border-dark-600 hover:border-dark-400 text-white font-medium px-8 py-3.5 rounded-xl transition duration-200"
              >
                <span>I'm a doctor</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dark-800">
              <div>
                <p className="text-2xl font-bold text-white mb-1">1,200+</p>
                <p className="text-sm text-dark-400">Verified doctors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">48k+</p>
                <p className="text-sm text-dark-400">Consultations done</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white flex items-center gap-1 mb-1">
                  4.8 <Star size={20} className="fill-white" />
                </p>
                <p className="text-sm text-dark-400">Average rating</p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Log in to CareSync</h2>

              <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-200 block">Email</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-dark-500 text-white placeholder-dark-500 transition"
                  />
                  {errors.email && <span className="text-xs text-rose-500 block">{errors.email.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-200 block">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-dark-500 text-white placeholder-dark-500 transition tracking-widest"
                  />
                  {errors.password && <span className="text-xs text-rose-500 block">{errors.password.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 bg-transparent border border-dark-600 hover:bg-dark-700 text-white font-medium rounded-xl transition duration-200 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span>Log in</span>}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-dark-300">
                  No account?{' '}
                  <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium transition">
                    Sign up free
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HomePage;
