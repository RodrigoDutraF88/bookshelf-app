"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ReviewCard } from "./ReviewCard";

type SortOrder = "recent" | "rating-high" | "rating-low";

export function ReviewsView() {
  const [sort, setSort] = useState<SortOrder>("recent");

  const { data: books, isLoading } = api.book.getAll.useQuery({});

  const reviewed = (books ?? [])
    .filter((b) => b.review?.rating ?? b.review?.body)
    .sort((a, b) => {
      if (sort === "rating-high") {
        return (b.review?.rating ?? 0) - (a.review?.rating ?? 0);
      }
      if (sort === "rating-low") {
        return (a.review?.rating ?? 0) - (b.review?.rating ?? 0);
      }
    
      const aDate = a.review?.updatedAt ? new Date(a.review.updatedAt).getTime() : 0;
      const bDate = b.review?.updatedAt ? new Date(b.review.updatedAt).getTime() : 0;
      return bDate - aDate;
    });

  const avgRating =
    reviewed.length > 0
      ? (
          reviewed.reduce((sum, b) => sum + (b.review?.rating ?? 0), 0) /
          reviewed.filter((b) => b.review?.rating).length
        ).toFixed(1)
      : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 40px)",
            color: "var(--color-text-primary)",
            marginBottom: "6px",
          }}
        >
          My Reviews
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          {reviewed.length > 0
            ? `${reviewed.length} review${reviewed.length !== 1 ? "s" : ""}${avgRating ? ` · avg ${avgRating} ★` : ""}`
            : "No reviews yet"}
        </p>
      </div>

  
      {reviewed.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              { value: "recent", label: "Most recent" },
              { value: "rating-high", label: "Highest rated" },
              { value: "rating-low", label: "Lowest rated" },
            ] as { value: SortOrder; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1.5px solid",
                borderColor:
                  sort === value ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor:
                  sort === value ? "var(--color-accent)" : "var(--color-surface)",
                color:
                  sort === value
                    ? "var(--color-text-inverse)"
                    : "var(--color-text-secondary)",
                fontSize: "13px",
                fontWeight: sort === value ? 700 : 500,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

   
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: "140px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-surface)",
              }}
            />
          ))}
        </div>
      ) : reviewed.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>📖</p>
          <p style={{ fontSize: "16px", marginBottom: "6px" }}>
            No reviews yet
          </p>
          <p style={{ fontSize: "13px" }}>
            Mark a book as Completed or Dropped to write your first review.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviewed.map((book) => (
            <ReviewCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}