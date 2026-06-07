import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[...Array(10)].map((_, index) => {
                const value = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-200`}
                        onClick={() => !readOnly && setRating(value)}
                        onMouseEnter={() => !readOnly && setHover(value)}
                        onMouseLeave={() => !readOnly && setHover(rating)}
                    >
                        <Star
                            size={readOnly ? 16 : 24}
                            className={`${value <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-500'
                                }`}
                        />
                    </button>
                );
            })}
            {!readOnly && <span className="ml-2 text-white font-bold">{hover || rating}/10</span>}
        </div>
    );
};

export default StarRating;
