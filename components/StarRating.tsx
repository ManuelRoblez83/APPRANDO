import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  maxStars?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  label,
  maxStars = 5 
}) => {
  const handleClick = (rating: number) => {
    onChange(rating);
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
        {label}
      </label>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-stone-200 dark:fill-stone-700 text-stone-300 dark:text-stone-600'
              } transition-colors`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-stone-600 dark:text-stone-400">
            {value}/{maxStars}
          </span>
        )}
      </div>
    </div>
  );
};


