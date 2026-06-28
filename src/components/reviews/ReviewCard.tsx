"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { ReviewModal } from "./ReviewModal";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface ReviewCardProps {
  book: BookWithRelations;
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED:         "Completed",
  DROPPED:           "Dropped",
  CURRENTLY_READING: "Reading",
  WANT_TO_READ:      "Want to Read",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:         "var(--spine-completed)",
  DROPPED:           "var(--spine-dropped)",
  CURRENTLY_READING: "var(--spine-reading)",
  WANT_TO_READ:      "var(--spine-want)",
};

export function ReviewCard({ book }: ReviewCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const review = book.review!;
  const rating = review.rating ?? 0;
  const body = review.body ?? "";
  const isLong = body.length > 200;

  const reviewDate = review.updatedAt
    ? new Date(review.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <article
        style={{
          display: "flex",
          gap: "16px",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          borderLeft: `4px solid ${STATUS_COLORS[book.status] ?? "var(--color-border)"}`,
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: "60px",
            height: "84px",
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-deep)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              width={60}
              height={84}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[book.status] ?? "var(--color-accent)"} 15%, var(--color-bg-deep))`,
                color: STATUS_COLORS[book.status] ?? "var(--color-accent)",
                fontFamily: "var(--font-serif)",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {book.title[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "6px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "2px",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {book.title}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                }}
              >
                {book.author}
              </p>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              style={{
                flexShrink: 0,
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-pill)",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }}
            >
              Edit
            </button>
          </div>

       
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: body ? "12px" : "0",
              flexWrap: "wrap",
            }}
          >
            {rating > 0 && (
              <span
                style={{
                  color: "var(--color-accent)",
                  fontSize: "14px",
                  letterSpacing: "1px",
                }}
              >
                {"★".repeat(rating)}
                <span style={{ color: "var(--color-border-strong)" }}>
                  {"★".repeat(5 - rating)}
                </span>
              </span>
            )}
            <span
              style={{
                fontSize: "11px",
                color: STATUS_COLORS[book.status] ?? "var(--color-text-muted)",
                fontWeight: 600,
                backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[book.status] ?? "var(--color-accent)"} 12%, transparent)`,
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {STATUS_LABELS[book.status]}
            </span>
            {reviewDate && (
              <span
                style={{ fontSize: "11px", color: "var(--color-text-muted)" }}
              >
                {reviewDate}
              </span>
            )}
          </div>

          {/* Review body */}
          {body && (
            <div>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: "var(--color-text-secondary)",
                  fontStyle: "italic",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: expanded ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                "{expanded ? body : body}"
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    color: "var(--color-accent)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 0 0",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
      </article>

      {showEdit && (
        <ReviewModal
          book={book}
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}