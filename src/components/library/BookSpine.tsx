"use client";

import type { Book, ReadingProgress } from "../../../generated/prisma";
import { useState } from "react";
import { ProgressModal } from "~/components/progress/ProgressModal";

type BookWithProgress = Book & {
  readingProgress: ReadingProgress | null;
};


const SPINE_COLORS: Record<string, string> = {
  WANT_TO_READ: "var(--spine-want)",
  CURRENTLY_READING: "var(--spine-reading)",
  COMPLETED: "var(--spine-completed)",
  DROPPED: "var(--spine-dropped)",
};

interface BookSpineProps {
  book: BookWithProgress;
}

export function BookSpine({ book }: BookSpineProps) {
  const [showProgress, setShowProgress] = useState(false);
  const [hovered, setHovered] = useState(false);

  const spineColor = SPINE_COLORS[book.status] ?? "var(--spine-want)";

  const progress = book.readingProgress;
  const percentage =
    progress?.totalPages && progress.totalPages > 0
      ? Math.min(
          100,
          Math.round((progress.currentPage / progress.totalPages) * 100),
        )
      : null;

  return (
    <>
      <div
        className={`book-spine${hovered ? " book-spine--hovered" : ""}`}
        style={{ "--spine-color": spineColor } as React.CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowProgress(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowProgress(true);
        }}
        aria-label={`Update progress for ${book.title}`}
      >
       
        <div className="book-spine__strip">
          <span className="book-spine__title">{book.title}</span>
          <span className="book-spine__author">{book.author}</span>
        </div>

      
        {book.status === "CURRENTLY_READING" && percentage !== null && (
          <div
            className="book-spine__progress-fill"
            style={{ height: `${percentage}%` }}
            aria-hidden="true"
          />
        )}

      
        {hovered && (
          <div className="book-spine__tooltip" role="tooltip">
            <p className="book-spine__tooltip-title">{book.title}</p>
            <p className="book-spine__tooltip-author">{book.author}</p>
            {percentage !== null && (
              <p className="book-spine__tooltip-progress">{percentage}% read</p>
            )}
            {book.status === "CURRENTLY_READING" && (
              <p className="book-spine__tooltip-cta">Click to update progress</p>
            )}
          </div>
        )}
      </div>

      {showProgress && book.status === "CURRENTLY_READING" && (
        <ProgressModal
          book={book}
          isOpen={showProgress}
          onClose={() => setShowProgress(false)}
        />
      )}
    </>
  );
}