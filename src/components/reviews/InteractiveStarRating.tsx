"use client";

import { useState } from "react";

interface InteractiveStarRatingProps {
  value: number | null;
  onChange: (rating: number) => void;
  size?: "md" | "lg";
}

const LABELS: Record<number, string> = {
  1: "Didn't like it",
  2: "It was ok",
  3: "Liked it",
  4: "Really liked it",
  5: "It was amazing",
};

export function InteractiveStarRating({
  value,
  onChange,
  size = "lg",
}: InteractiveStarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? value;
  const starSize = size === "lg" ? 32 : 24;

  return (
    <div className="star-rating-interactive">
      <div
        className="star-rating-interactive__stars"
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="star-rating-interactive__btn"
            role="radio"
            aria-checked={value === star}
            aria-label={LABELS[star]}
          >
            <StarIcon
              filled={active !== null && star <= active}
              size={starSize}
              color={
                active !== null && star <= active
                  ? "var(--color-accent)"
                  : "var(--color-surface-border)"
              }
            />
          </button>
        ))}
      </div>

      <p className="star-rating-interactive__label">
        {active !== null ? LABELS[active] : "Select a rating"}
      </p>
    </div>
  );
}

function StarIcon({
  filled,
  size,
  color,
}: {
  filled: boolean;
  size: number;
  color: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transition: "fill 0.1s ease, stroke 0.1s ease" }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}