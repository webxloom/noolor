"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface RatingProps {
  value?: number;
  max?: number;
  readonly?: boolean;
  size?: number;
  onChange?: (rating: number) => void;
}

export default function Rating({
  value = 0,
  max = 5,
  readonly = false,
  size = 20,
  onChange,
}: RatingProps) {
  const [hover, setHover] = useState(0);

  const displayValue = hover || value;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const rating = index + 1;

        return (
          <button
            key={rating}
            type="button"
            disabled={readonly}
            className="disabled:cursor-default"
            onMouseEnter={() => !readonly && setHover(rating)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => !readonly && onChange?.(rating)}
          >
            <Star
              size={size}
              className={
                rating <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
