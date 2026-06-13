import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Stethoscope, Info } from 'lucide-react';
import Alert from '../components/Common/Alert';

const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('patient');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: 'onChange' });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: role,
      phone: data.phone,
      address: data.address,
    };

    if (role === 'doctor') {
      payload.specialty = data.specialty;
      payload.experience = parseFloat(data.experience);
      payload.consultationFee = parseFloat(data.consultationFee);
      payload.licenseNumber = data.licenseNumber;
    } 

    const res = await authRegister(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-600 p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-2xl relative flex items-center justify-center z-10 my-8">
        <div className="bg-slate-50 w-full max-w-2xl rounded-[2rem] p-8 md:p-12 shadow-xl flex flex-col h-full max-h-[85vh]">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 text-center">Create your account</h2>
          <p className="text-slate-500 font-medium text-center mb-8">Join ASISHCARE CONSULTING today.</p>

          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          <Alert type="success" message={successMsg} />

          {/* Role Selector Toggle Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8 shrink-0">
            <button
              type="button"
              onClick={() => handleRoleChange('patient')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                role === 'patient' 
                  ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm transform scale-[1.02]' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-primary-200 hover:bg-slate-50'
              }`}
            >
              <User size={32} className={`mb-2 ${role === 'patient' ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className="font-bold text-sm">I am a Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('doctor')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                role === 'doctor' 
                  ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm transform scale-[1.02]' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-primary-200 hover:bg-slate-50'
              }`}
            >
              <Stethoscope size={32} className={`mb-2 ${role === 'doctor' ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className="font-bold text-sm">I am a Doctor</span>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-2 custom-scrollbar text-left">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                  />
                  {errors.name && <span className="text-[10px] text-rose-500 font-bold block mt-1 ml-1">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                    })}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                  />
                  {errors.email && <span className="text-[10px] text-rose-500 font-bold block mt-1 ml-1">{errors.email.message}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                  />
                  {errors.password && <span className="text-[10px] text-rose-500 font-bold block mt-1 ml-1">{errors.password.message}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Address</label>
                <input
                  type="text"
                  placeholder="123 Medical Drive, City, State"
                  {...register('address')}
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                />
              </div>

              {role === 'doctor' && (
                <div className="space-y-5 border-t-2 border-slate-100 pt-6 mt-4">
                  <div className="flex items-center space-x-2 text-primary-600 mb-2">
                    <Stethoscope size={20} />
                    <h3 className="font-bold text-lg text-slate-800">Professional Credentials</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Specialty</label>
                      <select
                        {...register('specialty', { required: 'Specialty required' })}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                      >
                        <option value="">Select Specialty</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Psychiatry">Psychiatry</option>
                      </select>
                      {errors.specialty && <span className="text-[10px] text-rose-500 font-bold block mt-1 ml-1">{errors.specialty.message}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">License Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MD-123456"
                        {...register('licenseNumber', { 
                          required: 'License number required',
                          pattern: {
                            value: /^[A-Z]{2,3}-\d{4,8}$/i,
                            message: 'Format must be like MD-123456'
                          }
                        })}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                      />
                      {errors.licenseNumber && <span className="text-[10px] text-rose-500 font-bold block mt-1 ml-1">{errors.licenseNumber.message}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Experience (Years)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        {...register('experience', { required: 'Required', min: 0 })}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 499"
                        {...register('consultationFee', { required: 'Required', min: 0 })}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium transition"
                      />
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-xl p-4 flex items-start space-x-3 border border-primary-100">
                    <Info size={20} className="text-primary-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-primary-800">
                      <strong>Verification Notice:</strong> Your medical license will be manually verified by our compliance team before your profile becomes visible to patients.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 shrink-0 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
