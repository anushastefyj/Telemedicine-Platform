import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldAlert } from 'lucide-react';
import RatingStars from './RatingStars';

const DoctorCard = ({ doctor }) => {
  const {
    _id,
    name,
    specialty,
    rating,
    totalReviews,
    consultationFee,
    profilePic,
    verified,
    experience,
  } = doctor;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition p-5 flex flex-col justify-between h-full">
      <div>
        <div className="relative mb-4">
          {profilePic ? (
            <img
              src={profilePic}
              alt={name}
              className="w-full h-48 object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-48 bg-sky-50 rounded-xl flex items-center justify-center text-primary-500 font-extrabold text-3xl">
              Dr. {name.split(' ')[0]}
            </div>
          )}
          {verified && (
            <span className="absolute top-3 right-3 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              Verified
            </span>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary-600 transition">
              Dr. {name}
            </h3>
            <p className="text-sm text-primary-600 font-medium mb-2">{specialty}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <RatingStars rating={rating} size={16} />
          <span className="text-sm font-semibold text-slate-700">{rating}</span>
          <span className="text-xs text-slate-400">({totalReviews} reviews)</span>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4 pb-4 border-b border-slate-50">
          <span>{experience} yrs experience</span>
          <span className="font-semibold text-slate-800">${consultationFee} fee</span>
        </div>
      </div>

      <Link
        to={`/doctors/${_id}`}
        className="block text-center w-full py-2.5 bg-slate-50 hover:bg-primary-500 hover:text-white text-primary-600 font-semibold text-sm rounded-xl transition-all"
      >
        View Profile & Book
      </Link>
    </div>
  );
};

export default DoctorCard;
