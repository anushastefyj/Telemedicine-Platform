import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorsAPI } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const DoctorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters state
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  const fetchDoctors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (specialty) params.specialty = specialty;
      if (rating) params.rating = rating;
      if (maxFee) params.maxFee = maxFee;

      const res = await getDoctorsAPI(params);
      if (res.success) {
        setDoctors(res.data);
      } else {
        setErrorMsg('Failed to load doctors');
      }
    } catch (err) {
      setErrorMsg('Failed to fetch doctors from service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (specialty) params.specialty = specialty;
    if (rating) params.rating = rating;
    if (maxFee) params.maxFee = maxFee;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSpecialty('');
    setRating('');
    setMaxFee('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Specialists</h1>
          <p className="text-slate-500 text-sm mt-1">Book virtual consultations with certified clinicians</p>
        </div>
      </div>

      <Alert type="error" message={errorMsg} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <SlidersHorizontal size={16} className="text-slate-400 mr-2" />
              <span>Search Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary-500 hover:text-primary-600 font-semibold"
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
            {/* Specialty Search */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Neurology">Neurology</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">★ 4.5 & up</option>
                <option value="4.0">★ 4.0 & up</option>
                <option value="3.5">★ 3.5 & up</option>
                <option value="3.0">★ 3.0 & up</option>
              </select>
            </div>

            {/* Max Consultation Fee */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Max Consultation Fee ($)</label>
              <input
                type="number"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Doctor Grid List */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner />
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-500">No doctors matched your criteria.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs rounded-xl transition"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorListPage;
