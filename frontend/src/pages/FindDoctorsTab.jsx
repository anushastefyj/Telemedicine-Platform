import React, { useState, useEffect } from 'react';
import { getDoctorsAPI } from '../services/api';
import { Search, Star, Clock, AlertCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';

const specialties = ['All', 'General', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry'];

// Helper to format doctor name correctly without double "Dr."
const formatDocName = (name) => name?.startsWith('Dr.') ? name : `Dr. ${name}`;

const FindDoctorsTab = ({ onViewProfile }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [bookingModalDoc, setBookingModalDoc] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await getDoctorsAPI();
        if (res.success) {
          setDoctors(res.data);
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = activeSpecialty === 'All' || doc.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in pb-10">
      
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">✓</div>
          <div>
            <p className="font-bold text-sm">Success!</p>
            <p className="text-xs">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#d1d5db] rounded-xl focus:outline-none focus:border-[#2c8a52] focus:ring-1 focus:ring-[#2c8a52] text-slate-800 font-medium transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveSpecialty(spec)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                activeSpecialty === spec 
                  ? 'bg-[#2c8a52] text-white border-[#2c8a52]' 
                  : 'bg-white text-[#374151] border-[#d1d5db] hover:border-[#2c8a52] hover:text-[#2c8a52]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-slate-500 font-medium">Showing {filteredDoctors.length} doctors</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-[240px] animate-pulse flex flex-col justify-between">
              <div className="flex gap-4"><div className="w-12 h-12 rounded-full bg-slate-200"></div><div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-3 bg-slate-200 rounded w-1/2"></div></div></div>
              <div className="space-y-2"><div className="h-3 bg-slate-200 rounded w-1/4"></div><div className="h-3 bg-slate-200 rounded w-1/3"></div></div>
              <div className="flex gap-3"><div className="flex-1 h-10 bg-slate-200 rounded-lg"></div><div className="flex-1 h-10 bg-slate-200 rounded-lg"></div></div>
            </div>
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => {
            const hasSlots = Math.random() > 0.3; // Fake availability
            return (
              <div key={doctor._id} className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:border-[#2c8a52] hover:-translate-y-1 transition-all duration-150 flex flex-col shadow-sm group">
                
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#dcfce7] text-[#166534] font-bold text-lg rounded-full flex items-center justify-center shrink-0">
                    {doctor.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-[#111827] truncate">{formatDocName(doctor.name)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {doctor.specialty}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6b7280] font-medium mt-1">{doctor.experience || 5} yrs experience</p>
                  </div>
                </div>

                {/* Middle row */}
                <div className="my-5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-[#f59e0b]">
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="fill-current" />
                      <Star size={14} className="text-[#e5e7eb]" />
                    </div>
                    <span className="text-[12px] font-bold text-[#374151]">4.0</span>
                  </div>
                  <p className="text-[14px] font-bold text-[#111827]">₹{doctor.consultationFee || 500} <span className="text-[12px] font-medium text-slate-500">/ session</span></p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-2 h-2 rounded-full ${hasSlots ? 'bg-[#4ade80]' : 'bg-[#f59e0b]'}`}></span>
                    <span className="text-[12px] font-bold text-[#374151]">{hasSlots ? 'Available today' : 'Next available: Tomorrow'}</span>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex gap-3 mt-auto pt-4 border-t border-[#e5e7eb]">
                  <button 
                    onClick={() => onViewProfile(doctor._id)}
                    className="flex-1 py-2.5 bg-transparent border border-[#2c8a52] text-[#2c8a52] hover:bg-[#2c8a52] hover:text-white font-bold rounded-lg text-sm transition-colors text-center"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => setBookingModalDoc(doctor)}
                    className="flex-1 py-2.5 bg-[#2c8a52] hover:bg-[#166534] text-white font-bold rounded-lg text-sm transition-colors shadow-sm text-center"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-[#d1d5db] rounded-2xl p-12 flex flex-col items-center text-center max-w-xl mx-auto mt-10">
          <UserSearch size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No doctors found for '{searchQuery}'</h3>
          <button onClick={() => { setSearchQuery(''); setActiveSpecialty('All'); }} className="text-[#2c8a52] font-bold text-sm hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {bookingModalDoc && (
        <BookingModal 
          doctor={bookingModalDoc} 
          onClose={() => setBookingModalDoc(null)} 
          onSuccess={() => {
            setSuccessMsg(`Successfully booked appointment with ${formatDocName(bookingModalDoc.name)}`);
            setBookingModalDoc(null);
            setTimeout(() => setSuccessMsg(''), 5000);
          }}
        />
      )}
    </div>
  );
};

export default FindDoctorsTab;
