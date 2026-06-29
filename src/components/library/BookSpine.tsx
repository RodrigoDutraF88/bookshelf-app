"use client";

import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { useState } from "react";
import { ProgressModal } from "~/components/progress/ProgressModal";


type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface BookSpineProps {
  book: BookWithRelations;
  index: number; 
  
}


function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SPINE_COLORS: Record<string, string> = {
  WANT_TO_READ:      "var(--spine-want)",
  CURRENTLY_READING: "var(--spine-reading)",
  COMPLETED:         "var(--spine-completed)",
  DROPPED:           "var(--spine-dropped)",
};


const ALT_COLORS = [
  "var(--spine-alt-1)",
  "var(--spine-alt-2)",
  "var(--spine-alt-3)",
  "var(--spine-alt-4)",
  "var(--spine-alt-5)",
  "var(--spine-alt-6)",
];

export function BookSpine({ book, index }: BookSpineProps) {
  const [hovered, setHovered] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const hash = hashString(book.id);

  const width = 45 + (hash % 5) * 5; 


  const height = 200 + ((hash >> 3) % 7) * 10; 


  const tiltIndex = (hash >> 6) % 5;
  const tiltValues = [-1.5, -0.8, 0, 0, 0.8]; 
  const tilt = tiltValues[tiltIndex] ?? 0;


  const useAlt = book.status !== "CURRENTLY_READING" && (hash >> 9) % 4 === 0;
  const spineColor = useAlt
    ? (ALT_COLORS[(hash >> 12) % ALT_COLORS.length] ?? "var(--spine-want)")
    : (SPINE_COLORS[book.status] ?? "var(--spine-want)");

  const progress =
    book.readingProgress?.currentPage && book.readingProgress?.totalPages
      ? Math.min(
          100,
          Math.round(
            (book.readingProgress.currentPage / book.readingProgress.totalPages) * 100,
          ),
        )
      : null;

  return (
    <>
      <div
        className={`book-spine${hovered ? " book-spine--hovered" : ""}`}
        style={{
          "--spine-color": spineColor,
          "--spine-width": `${width}px`,
          "--spine-height": `${height}px`,
          "--spine-tilt": `${tilt}deg`,
        } as React.CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (book.status === "CURRENTLY_READING") setShowProgress(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (book.status === "CURRENTLY_READING") setShowProgress(true);
          }
        }}
        aria-label={`${book.title} by ${book.author}${
          book.status === "CURRENTLY_READING" ? " — click to update progress" : ""
        }`}
      >
        <div className="book-spine__strip">
          <span className="book-spine__title">{book.title}</span>
          <span className="book-spine__author">{book.author}</span>
        </div>

   
        {book.status === "CURRENTLY_READING" && progress !== null && (
          <div
            className="book-spine__progress-fill"
            style={{ height: `${progress}%` }}
            aria-hidden="true"
          />
        )}

        
        {hovered && (
          <div className="book-spine__tooltip" role="tooltip">
            <p className="book-spine__tooltip-title">{book.title}</p>
            <p className="book-spine__tooltip-author">{book.author}</p>
            {progress !== null && (
              <p className="book-spine__tooltip-progress">{progress}% read</p>
            )}
            {book.review?.rating && (
              <p className="book-spine__tooltip-progress">
                {"★".repeat(book.review.rating)}{"☆".repeat(5 - book.review.rating)}
              </p>
            )}
            {book.status === "CURRENTLY_READING" && (
              <p className="book-spine__tooltip-cta">Click to update progress</p>
            )}
          </div>
        )}
      </div>

      {showProgress && (
        <ProgressModal
          book={book}
          isOpen={showProgress}
          onClose={() => setShowProgress(false)}
        />
      )}
    </>
  );
}