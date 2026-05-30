import React from 'react';
import RatingStars from './RatingStars';

const ReviewCard = ({ review }) => {
  const { rating, comment, createdAt, patientId } = review;
  const name = patientId?.name || 'Anonymous Patient';

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {patientId?.profilePic ? (
            <img
              src={patientId.profilePic}
              alt={name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h5 className="font-semibold text-slate-800 text-sm">{name}</h5>
            <span className="text-[10px] text-slate-400">{formattedDate}</span>
          </div>
        </div>
        <RatingStars rating={rating} size={14} />
      </div>
      {comment && <p className="text-slate-600 text-xs italic leading-relaxed">"{comment}"</p>}
    </div>
  );
};

export default ReviewCard;
