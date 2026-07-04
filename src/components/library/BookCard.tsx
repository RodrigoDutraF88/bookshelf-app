"use client";

import Image from "next/image";
import { useState } from "react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { StatusBadge, STATUS_CONFIG } from "../../components/ui/StatusBadge";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { StarRating } from "../../components/ui/StarRating";
import { ProgressBar } from "../../components/progress/ProgressBar";
import { BookDetailModal } from "~/components/library/BookDetailModal";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

type Props = {
  book: BookWithRelations;
  onDeleted?: () => void;
};

export function BookCard({ book, onDeleted }: Props) {
  const [isHovered, setIsHovered]     = useState(false);
  const [showDetail, setShowDetail]   = useState(false);

  const progress =
    book.readingProgress?.currentPage && book.readingProgress?.totalPages
      ? Math.round(
          (book.readingProgress.currentPage / book.readingProgress.totalPages) * 100,
        )
      : null;

  const spineColor = STATUS_CONFIG[book.status].spineVar;

  return (
    <>
   
      <article
        className="relative flex flex-col h-full rounded-lg overflow-hidden"
        role="button"
        tabIndex={0}
        aria-label={`${book.title} by ${book.author} — click to open`}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowDetail(true); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: "var(--color-surface)",
          borderLeft:      `3px solid ${spineColor}`,
          boxShadow:       isHovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
          transition:      "box-shadow var(--transition-base), transform var(--transition-base)",
          transform:       isHovered ? "translateY(-2px)" : "translateY(0)",
          cursor:          "pointer",
        }}
      >
   
        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-surface-raised)] flex-shrink-0">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              style={{
                transition: "transform var(--transition-slow)",
                transform:  isHovered ? "scale(1.03)" : "scale(1)",
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${spineColor} 20%, var(--color-surface-raised)) 0%, var(--color-surface-raised) 100%)`,
              }}
              aria-hidden="true"
            >
              <span
                className="text-5xl font-bold select-none"
                style={{ fontFamily: "var(--font-display)", color: spineColor, opacity: 0.5 }}
              >
                {book.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}


          {book.status === "CURRENTLY_READING" && progress !== null && (
            <div
              className="absolute bottom-2 right-2 rounded-full p-0.5"
              style={{ backgroundColor: "rgba(15,15,15,0.85)", backdropFilter: "blur(4px)" }}
            >
              <ProgressRing percentage={progress} size={38} />
            </div>
          )}

       
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter:  "blur(2px)",
              opacity:         isHovered ? 1 : 0,
              transition:      "opacity var(--transition-fast)",
            }}
            aria-hidden="true"
          >
            <span
              style={{
                fontSize:        "12px",
                fontWeight:      600,
                fontFamily:      "var(--font-body)",
                color:           "#fff",
                backgroundColor: "rgba(200,135,58,0.85)",
                padding:         "6px 14px",
                borderRadius:    "999px",
                letterSpacing:   "0.03em",
              }}
            >
              Open
            </span>
          </div>
        </div>

  
        <div className="flex flex-col gap-2 p-3 flex-1">
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            {book.title}
          </h3>

          <p className="text-xs leading-none" style={{ color: "var(--color-text-muted)" }}>
            {book.author}
          </p>

          {book.review?.rating && <StarRating rating={book.review.rating} size="sm" />}

          <div className="mt-auto pt-2">
            <StatusBadge status={book.status} size="sm" />
          </div>

          {book.status === "CURRENTLY_READING" && book.readingProgress?.currentPage != null && (
            <ProgressBar
              currentPage={book.readingProgress.currentPage}
              totalPages={book.readingProgress.totalPages ?? null}
              compact
            />
          )}

          {book.review?.body && (
            <p
              className="text-[11px] leading-snug line-clamp-2 italic"
              style={{ color: "var(--color-text-muted)" }}
            >
              {'"'}{book.review.body}{'"'}
            </p>
          )}
        </div>
      </article>


      <BookDetailModal
        book={book}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          onDeleted?.(); 
        }}
      />
    </>
  );
}