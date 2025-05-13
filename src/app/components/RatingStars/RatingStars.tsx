"use client";

import { Star } from "lucide-react";
import React from "react";

interface StarRatingDisplayProps {
  averageRating: number;  
  totalRatings: number;  
}

export default function StarRatingDisplay({
  averageRating,
  totalRatings,
}: StarRatingDisplayProps) {
  const filledStars = Math.floor(averageRating); 
  const hasPartial = averageRating - filledStars > 0; 
  const MAX_STARS = 5;

  return (
    <section className="flex items-center gap-2">
      <section className="flex">
        {Array.from({ length: MAX_STARS }).map((_, i) => {
          const isFull = i < filledStars;
          const isPartial = i === filledStars && hasPartial;

          return (
            <article key={i} className="relative w-6 h-6">
              <Star className="w-6 h-6 text-gray-400" />
              {(isFull || isPartial) && (
                <Star
                  className="w-6 h-6 text-yellow-400 absolute top-0 left-0"
                  style={{
                    clipPath: isPartial
                      ? `inset(0 ${100 - (averageRating - filledStars) * 100}% 0 0)`
                      : "none",
                  }}
                />
              )}
            </article>
          );
        })}
      </section>
      <p className="text-sm text-gray-300">{totalRatings} ratings</p>
    </section>
  );
}
