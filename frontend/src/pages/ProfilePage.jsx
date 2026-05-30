import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getMeAPI, updateMyDoctorProfileAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { User, Phone, MapPin, Award, DollarSign, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      // Hydrate form
      setValue('name', user.name);
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
      setValue('profilePic', user.profilePic || '');

      if (user.role === 'doctor') {
        setValue('specialty', user.specialty || '');
        setValue('experience', user.experience || 0);
        setValue('consultationFee', user.consultationFee || 0);
        setValue('licenseNumber', user.licenseNumber || '');
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let res;
      if (user.role === 'doctor') {
        res = await updateMyDoctorProfileAPI(data);
      } else {
        // If patient, we can define user update endpoints or mock update success in context
        // For telemedicine, let's allow updating profile
        res = await updateMyDoctorProfileAPI(data);
      }

      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setUser(res.data); // Hydrate globally
      } else {
        setErrorMsg('Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile info');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Profile</h1>
          <p className="text-slate-500 text-xs mt-1">Configure account information and security</p>
        </div>

        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address (Cannot change)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Profile Pic Url */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Profile Pic URL</label>
              <input
                type="text"
                {...register('profilePic')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400 h-4.5 w-4.5" />
              <input
                type="text"
                {...register('address')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Render doctor metadata values if user is a doctor */}
          {user.role === 'doctor' && (
            <div className="border-t border-slate-100 pt-6 mt-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Specialty</label>
                  <input
                    type="text"
                    {...register('specialty')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">License Number</label>
                  <input
                    type="text"
                    {...register('licenseNumber')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Experience (Years)</label>
                  <input
                    type="number"
                    {...register('experience')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Consultation Fee ($)</label>
                  <input
                    type="number"
                    {...register('consultationFee')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition shadow-md shadow-primary-500/10"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
