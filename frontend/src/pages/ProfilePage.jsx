import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getMeAPI, updateMyDoctorProfileAPI, uploadProfilePhotoAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { User, Phone, MapPin, Camera, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading]         = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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

            {/* Profile Photo Upload */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Profile Photo</label>
              <div className="flex items-center gap-5">
                {/* Avatar preview */}
                <div 
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 group cursor-pointer shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview || user?.profilePic ? (
                    <img src={avatarPreview || user.profilePic} alt="Avatar" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-bold text-2xl">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setErrorMsg('');
                      setSuccessMsg('');

                      // 1. Validate File Type
                      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                      if (!validTypes.includes(file.type)) {
                        setErrorMsg('Only JPG, PNG, or WebP images are allowed.');
                        return;
                      }

                      // 2. Validate File Size (< 5MB)
                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        setErrorMsg('File too large. Max 5MB.');
                        return;
                      }

                      // 3. Optimistic Preview Update
                      const objectUrl = URL.createObjectURL(file);
                      setAvatarPreview(objectUrl);
                      setUser((prev) => ({ ...prev, profilePic: objectUrl }));

                      // 4. Upload
                      setPhotoLoading(true);
                      
                      try {
                        const formData = new FormData();
                        formData.append('photo', file);
                        
                        // Fake progress interval for UX since some backends don't stream progress well
                        let currentProgress = 0;
                        const progressInterval = setInterval(() => {
                          currentProgress += 10;
                          if (currentProgress <= 90) {
                            document.getElementById('upload-progress').style.width = `${currentProgress}%`;
                          }
                        }, 200);

                        const res = await uploadProfilePhotoAPI(formData, (progressEvent) => {
                           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                           document.getElementById('upload-progress').style.width = `${percentCompleted}%`;
                        });
                        
                        clearInterval(progressInterval);
                        document.getElementById('upload-progress').style.width = `100%`;

                        if (res.success) {
                          setSuccessMsg('Profile photo updated successfully!');
                          setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
                        }
                      } catch (err) {
                        setErrorMsg(err?.response?.data?.message || 'Photo upload failed. Please try again.');
                        // Revert optimistic update
                        setAvatarPreview(null);
                        setUser((prev) => ({ ...prev, profilePic: user.profilePic }));
                      } finally {
                        setPhotoLoading(false);
                        setTimeout(() => {
                          const pb = document.getElementById('upload-progress');
                          if(pb) pb.style.width = '0%';
                        }, 1000);
                      }
                    }}
                  />
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoLoading}
                        className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 text-slate-700 font-bold px-4 py-2 rounded-xl transition shadow-sm"
                      >
                        {photoLoading
                          ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                          : <><Camera size={16} /> Change photo</>
                        }
                      </button>
                      <p className="text-xs font-medium text-slate-400">JPG, PNG, WEBP · Max 5MB</p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className={`h-1.5 w-full max-w-xs bg-slate-100 rounded-full overflow-hidden transition-opacity duration-300 ${photoLoading ? 'opacity-100' : 'opacity-0'}`}>
                      <div id="upload-progress" className="h-full bg-primary-500 rounded-full transition-all duration-200 ease-out" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
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
