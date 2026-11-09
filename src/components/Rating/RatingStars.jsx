import React from "react";
import { FaStar } from "react-icons/fa";

export const RatingStars = ({ rating = 0, hover = null, onSelect = null, onHover = null, size = 14, interactive = false }) => {
  return (
    <div className="flex gap-1 items-center">
      {[...Array(5)].map((_, index) => {
        const value = index + 1;
        const activeColor = value <= (hover || rating) ? "#ffc107" : "#e4e5e9";
        
        if (interactive) {
          return (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name="user-rating"
                value={value}
                onClick={() => onSelect && onSelect(value)}
                className="hidden"
              />
              <FaStar
                size={size}
                className="transition-colors hover:scale-110 active:scale-95 duration-100"
                color={activeColor}
                onMouseEnter={() => onHover && onHover(value)}
                onMouseLeave={() => onHover && onHover(null)}
              />
            </label>
          );
        }

        return (
          <FaStar
            key={value}
            size={size}
            color={activeColor}
          />
        );
      })}
    </div>
  );
};
