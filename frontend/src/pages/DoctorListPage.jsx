import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorsAPI } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { Search } from 'lucide-react';

const DoctorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');

  const fetchDoctors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (specialty) params.specialty = specialty;
      // You could add text search to API here if supported

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (specialty) params.specialty = specialty;
    setSearchParams(params);
  };

  return (
    <div className="bg-dark-900 min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Alert type="error" message={errorMsg} />

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-10 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-dark-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-dark-500 text-white placeholder-dark-400"
            />
          </div>
          
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-dark-500 appearance-none"
          >
            <option value="">All specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-transparent border border-dark-600 hover:bg-dark-800 text-white font-medium rounded-xl transition"
          >
            Search
          </button>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-12 text-center flex flex-col items-center">
            <p className="text-white font-medium text-lg">No doctors matched your criteria.</p>
            <button
              onClick={() => { setSpecialty(''); setSearchQuery(''); setSearchParams({}); }}
              className="mt-4 px-6 py-2 bg-transparent border border-dark-600 hover:bg-dark-700 text-white font-medium rounded-xl transition"
            >
              Reset Search Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorListPage;
