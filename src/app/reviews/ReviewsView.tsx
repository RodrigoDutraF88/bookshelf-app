"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ReviewCard } from "../../components/reviews/ReviewCard";

type SortOrder = "recent" | "rating-high" | "rating-low";

export function ReviewsView() {
  const [sort, setSort] = useState<SortOrder>("recent");
  const { data: books, isLoading } = api.book.getAll.useQuery({});

  const reviewed = (books ?? [])
    .filter((b) => b.review?.rating != null || b.review?.body)
    .sort((a, b) => {
      if (sort === "rating-high")
        return (b.review?.rating ?? 0) - (a.review?.rating ?? 0);
      if (sort === "rating-low")
        return (a.review?.rating ?? 0) - (b.review?.rating ?? 0);
      const aT = a.review?.updatedAt ? new Date(a.review.updatedAt).getTime() : 0;
      const bT = b.review?.updatedAt ? new Date(b.review.updatedAt).getTime() : 0;
      return bT - aT;
    });

  const ratedBooks = reviewed.filter((b) => b.review?.rating != null);
  const avgRating =
    ratedBooks.length > 0
      ? (
          ratedBooks.reduce((s, b) => s + (b.review?.rating ?? 0), 0) /
          ratedBooks.length
        ).toFixed(1)
      : null;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(26px, 5vw, 38px)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}
        >
          My Reviews
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          {reviewed.length > 0
            ? `${reviewed.length} review${reviewed.length !== 1 ? "s" : ""}${avgRating ? ` · ${avgRating} ★ average` : ""}`
            : "Your reading journal lives here"}
        </p>
      </div>

  
      {reviewed.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
          {(
            [
              { value: "recent",      label: "Most recent" },
              { value: "rating-high", label: "Highest rated" },
              { value: "rating-low",  label: "Lowest rated" },
            ] as { value: SortOrder; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid",
                borderColor: sort === value ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: sort === value ? "var(--color-accent)" : "var(--color-surface)",
                color: sort === value ? "#fff" : "var(--color-text-secondary)",
                fontSize: "13px",
                fontWeight: sort === value ? 700 : 500,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                transition: "all 150ms ease",
                boxShadow: sort === value ? "0 2px 8px var(--color-accent-glow)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: "130px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            />
          ))}
        </div>
      ) : reviewed.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            textAlign: "center",
            gap: "12px",
          }}
        >
          {/* Decorative mini shelf */}
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" aria-hidden="true">
            {[
              { x: 8,  h: 36, c: "#4A7C59" },
              { x: 22, h: 44, c: "#C8873A" },
              { x: 36, h: 30, c: "#6B8FA8" },
              { x: 48, h: 40, c: "#B85450" },
              { x: 62, h: 34, c: "#8B6B8A" },
              { x: 76, h: 42, c: "#4A7C59" },
              { x: 90, h: 28, c: "#C8873A" },
              { x: 102,h: 38, c: "#6B8FA8" },
            ].map((b, i) => (
              <rect key={i} x={b.x} y={48 - b.h} width={12} height={b.h} rx="1.5" fill={b.c} opacity="0.5" />
            ))}
            <rect x="0" y="48" width="120" height="4" rx="1" fill="#8B6340" />
            <rect x="0" y="52" width="120" height="3" rx="1" fill="#3D2314" opacity="0.6" />
          </svg>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            No reviews yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", maxWidth: "260px", lineHeight: 1.6 }}>
            Mark a book as Completed or Dropped to write your first review.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {reviewed.map((book) => (
            <ReviewCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}