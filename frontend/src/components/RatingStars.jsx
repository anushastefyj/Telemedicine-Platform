import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, onRatingChange, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];

  const roundedRating = Math.round(rating * 2) / 2; // rounds to nearest 0.5

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => {
        const isFilled = onRatingChange ? rating >= star : roundedRating >= star;
        const isHalf = !onRatingChange && roundedRating === star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400 text-amber-400 opacity-70' // approximation for half star
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
