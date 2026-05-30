import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorByIdAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import { Calendar, Clock, DollarSign, Award, MapPin, BadgeCheck } from 'lucide-react';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await getDoctorByIdAPI(id);
        if (res.success) {
          setData(res.data);
        } else {
          setErrorMsg('Failed to load doctor profile');
        }
      } catch (err) {
        setErrorMsg('Failed to retrieve doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (errorMsg) return <div className="max-w-xl mx-auto py-8"><Alert type="error" message={errorMsg} /></div>;
  if (!data) return null;

  const { doctor, reviews } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
        {doctor.profilePic ? (
          <img
            src={doctor.profilePic}
            alt={doctor.name}
            className="w-36 h-36 rounded-2xl object-cover ring-4 ring-primary-50"
          />
        ) : (
          <div className="w-36 h-36 rounded-2xl bg-sky-50 flex items-center justify-center text-primary-500 font-extrabold text-4xl">
            Dr. {doctor.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dr. {doctor.name}</h1>
              {doctor.verified && <BadgeCheck className="text-teal-500 h-6 w-6" />}
            </div>
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{doctor.specialty}</p>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-2">
            <RatingStars rating={doctor.rating} size={18} />
            <span className="text-sm font-bold text-slate-800">{doctor.rating}</span>
            <span className="text-xs text-slate-400">({doctor.totalReviews} reviews)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-slate-500">
            <div className="flex items-center">
              <Award size={16} className="text-slate-400 mr-1.5" />
              <span>{doctor.experience} Years Experience</span>
            </div>
            {doctor.address && (
              <div className="flex items-center">
                <MapPin size={16} className="text-slate-400 mr-1.5" />
                <span>{doctor.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center w-full md:w-64 space-y-4">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Consultation Fee</span>
            <span className="text-3xl font-black text-slate-900">${doctor.consultationFee}</span>
          </div>
          <Link
            to={`/book-appointment/${doctor._id}`}
            className="block text-center w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition shadow-md shadow-primary-500/10"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Weekly Schedule */}
        <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base flex items-center mb-4 pb-2 border-b border-slate-50">
            <Clock className="text-slate-400 mr-2" size={18} />
            <span>Weekly Schedule</span>
          </h3>
          {doctor.schedule && doctor.schedule.length > 0 ? (
            <ul className="space-y-3">
              {doctor.schedule.map((item, idx) => (
                <li key={idx} className="flex justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{item.day}</span>
                  <span>{item.startTime} - {item.endTime}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No scheduled hours listed.</p>
          )}
        </div>

        {/* Reviews Lists */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base pb-2 border-b border-slate-50">
            Patient Reviews ({reviews.length})
          </h3>

          {reviews.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <ReviewCard key={rev._id} review={rev} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No reviews for this doctor yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
