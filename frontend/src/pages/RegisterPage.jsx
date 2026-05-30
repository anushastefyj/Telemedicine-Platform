import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Mail, Lock, Phone, MapPin, Award, DollarSign, FileText } from 'lucide-react';
import Alert from '../components/Common/Alert';

const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('patient'); // Default role: patient

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    reset(); // Clear errors and inputs when switching role structure
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Pre-format nested structure for Patient / Doctor
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
    } else if (role === 'patient') {
      payload.medicalHistory = data.medicalHistory ? data.medicalHistory.split(',').map((h) => h.trim()) : [];
      payload.allergies = data.allergies ? data.allergies.split(',').map((a) => a.trim()) : [];
      payload.insuranceInfo = {
        provider: data.insuranceProvider || '',
        policyNumber: data.insurancePolicyNumber || '',
      };
    }

    const res = await authRegister(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Registration successful! Redirecting...');
      setTimeout(() => {
        if (role === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Join CareSync healthcare platform</p>
        </div>

        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
        <Alert type="success" message={successMsg} />

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-center">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              role === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            I am a Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              role === 'doctor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            I am a Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Full Name is required' })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 font-semibold">{errors.password.message}</span>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
              <input
                type="text"
                placeholder="123 Care St, Health City"
                {...register('address')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* DYNAMIC FIELDSET FOR DOCTORS */}
          {role === 'doctor' && (
            <div className="border-t border-slate-100 pt-4 mt-2 space-y-4 fade-in">
              <h3 className="font-bold text-slate-800 text-sm">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Specialty */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Specialty</label>
                  <select
                    {...register('specialty', { required: 'Specialty is required' })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Select Specialty</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                  {errors.specialty && <span className="text-[10px] text-rose-500 font-semibold">{errors.specialty.message}</span>}
                </div>

                {/* License Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">License Number</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                    <input
                      type="text"
                      placeholder="MD123456"
                      {...register('licenseNumber', { required: 'License number is required' })}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  {errors.licenseNumber && <span className="text-[10px] text-rose-500 font-semibold">{errors.licenseNumber.message}</span>}
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="5"
                    {...register('experience', { required: 'Experience is required', min: 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {errors.experience && <span className="text-[10px] text-rose-500 font-semibold">{errors.experience.message}</span>}
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Consultation Fee ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                    <input
                      type="number"
                      placeholder="100"
                      {...register('consultationFee', { required: 'Fee is required', min: 0 })}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  {errors.consultationFee && <span className="text-[10px] text-rose-500 font-semibold">{errors.consultationFee.message}</span>}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDSET FOR PATIENTS */}
          {role === 'patient' && (
            <div className="border-t border-slate-100 pt-4 mt-2 space-y-4 fade-in">
              <h3 className="font-bold text-slate-800 text-sm">Medical Details (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Medical History */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Medical History</label>
                  <input
                    type="text"
                    placeholder="Asthma, Hypertension (comma separated)"
                    {...register('medicalHistory')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                {/* Allergies */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Allergies</label>
                  <input
                    type="text"
                    placeholder="Peanuts, Penicillin (comma separated)"
                    {...register('allergies')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                {/* Insurance Provider */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Insurance Provider</label>
                  <input
                    type="text"
                    placeholder="Blue Cross"
                    {...register('insuranceProvider')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                {/* Policy Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Policy Number</label>
                  <input
                    type="text"
                    placeholder="POL123456"
                    {...register('insurancePolicyNumber')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition shadow-md shadow-primary-500/10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
