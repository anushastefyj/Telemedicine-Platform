import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const {
    _id,
    name,
    specialty,
    rating,
    consultationFee,
    profilePic,
    experience,
  } = doctor;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 flex flex-col h-full hover:border-dark-600 transition">
      
      <div className="flex items-center space-x-4 mb-6">
        {profilePic ? (
          <img
            src={profilePic}
            alt={name}
            className="w-14 h-14 object-cover rounded-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-lg shrink-0">
            {name?.charAt(0).toUpperCase()}{name?.split(' ')[1]?.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div>
          <h3 className="font-bold text-white text-lg">Dr. {name}</h3>
          <p className="text-dark-300 text-sm">{specialty} · {experience || 5} yrs</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <div className="flex text-[#F59E0B]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className={s <= Math.round(rating) ? "fill-current" : "opacity-30"} />
            ))}
          </div>
          <span className="text-white font-bold text-sm ml-2">{rating || '5.0'}</span>
        </div>
        
        <div className="text-white font-bold text-sm">
          ₹{consultationFee || 200} <span className="text-dark-300 font-normal">/ session</span>
        </div>
      </div>

      <div className="mt-auto">
        <Link
          to={`/doctors/${_id}`}
          className="block w-full py-3 bg-transparent border border-dark-600 hover:bg-dark-700 text-white font-medium text-sm text-center rounded-xl transition-all"
        >
          Book appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
