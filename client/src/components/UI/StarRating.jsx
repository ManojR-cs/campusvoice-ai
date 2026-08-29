import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onRate && onRate(star)}
            className={`p-1 transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          >
            <Star
              className={`w-6 h-6 ${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
