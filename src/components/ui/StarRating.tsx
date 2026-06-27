
type Props = {
  rating: number | null;  
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "sm" }: Props) {
  if (rating === null) return null;

  const starSize = size === "sm" ? 12 : 16;

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={starSize}
          height={starSize}
          viewBox="0 0 16 16"
          fill={i < rating ? "var(--color-accent)" : "var(--color-border-hover)"}
          aria-hidden="true"
        >
          <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" />
        </svg>
      ))}
    </span>
  );
}