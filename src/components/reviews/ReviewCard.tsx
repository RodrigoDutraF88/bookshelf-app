"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { ReviewModal } from "./ReviewModal";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED:         "var(--spine-completed)",
  DROPPED:           "var(--spine-dropped)",
  CURRENTLY_READING: "var(--spine-reading)",
  WANT_TO_READ:      "var(--spine-want)",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED:         "Completed",
  DROPPED:           "Dropped",
  CURRENTLY_READING: "Reading",
  WANT_TO_READ:      "Want to read",
};

export function ReviewCard({ book }: { book: BookWithRelations }) {
  const [showEdit, setShowEdit] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const review = book.review!;
  const rating = review.rating ?? 0;
  const body = review.body ?? "";
  const color = STATUS_COLOR[book.status] ?? "var(--color-accent)";

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
          borderLeft: `4px solid ${color}`,
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          transition: "box-shadow 150ms ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "var(--shadow-md)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "var(--shadow-sm)")
        }
      >
        <div
          style={{
            width: 56,
            height: 80,
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              width={56}
              height={80}
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
                backgroundColor: `color-mix(in srgb, ${color} 15%, var(--color-bg-deep))`,
                color,
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              {book.title[0]}
            </div>
          )}
        </div>

    
        <div style={{ flex: 1, minWidth: 0 }}>
   
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.3,
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {book.title}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
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
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 150ms ease",
                whiteSpace: "nowrap",
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
              gap: "8px",
              marginBottom: body ? "12px" : "0",
              flexWrap: "wrap",
            }}
          >
            {rating > 0 && (
              <span style={{ fontSize: "13px", letterSpacing: "1px", lineHeight: 1 }}>
                <span style={{ color: "var(--color-accent)" }}>{"★".repeat(rating)}</span>
                <span style={{ color: "var(--color-border-strong)" }}>
                  {"★".repeat(5 - rating)}
                </span>
              </span>
            )}

            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color,
                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {STATUS_LABEL[book.status]}
            </span>

            {reviewDate && (
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                {reviewDate}
              </span>
            )}
          </div>

          {body && (
            <div>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  overflow: expanded ? "visible" : "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: expanded ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {'"'}{body}{'"'}
              </p>
              {body.length > 180 && (
                <button
                  onClick={() => setExpanded((x) => !x)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--color-accent)",
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