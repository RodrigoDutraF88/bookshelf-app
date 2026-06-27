"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";

type BookWithProgress = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface ProgressModalProps {
  book: BookWithProgress;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressModal({ book, isOpen, onClose }: ProgressModalProps) {
  const utils = api.useUtils();
  const existing = book.readingProgress;

  const [currentPage, setCurrentPage] = useState(
    existing?.currentPage?.toString() ?? "0",
  );
  const [totalPages, setTotalPages] = useState(
    existing?.totalPages?.toString() ?? "",
  );
  const [startedAt, setStartedAt] = useState(
    existing?.startedAt
      ? new Date(existing.startedAt).toISOString().split("T")[0]
      : "",
  );
  const [finishedAt, setFinishedAt] = useState(
    existing?.finishedAt
      ? new Date(existing.finishedAt).toISOString().split("T")[0]
      : "",
  );

  
  useEffect(() => {
    setCurrentPage(existing?.currentPage?.toString() ?? "0");
    setTotalPages(existing?.totalPages?.toString() ?? "");
    setStartedAt(
      existing?.startedAt
        ? new Date(existing.startedAt).toISOString().split("T")[0]
        : "",
    );
    setFinishedAt(
      existing?.finishedAt
        ? new Date(existing.finishedAt).toISOString().split("T")[0]
        : "",
    );
  }, [book.id, existing]);

  const upsert = api.progress.upsert.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      onClose();
    },
  });

  const current = parseInt(currentPage, 10) || 0;
  const total = parseInt(totalPages, 10) || 0;
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  function handleSubmit() {
    if (current < 0 || (total > 0 && current > total)) return;

    upsert.mutate({
      bookId: book.id,
      currentPage: current,
      totalPages: total > 0 ? total : undefined,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      finishedAt: finishedAt ? new Date(finishedAt) : undefined,
    });
  }

  if (!isOpen) return null;

  return (
    <>
      
      <div
        className="progress-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

  
      <div
        className="progress-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-modal-title"
      >
       
        <div className="progress-modal__header">
          <div className="progress-modal__book-info">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                className="progress-modal__cover"
              />
            ) : (
              <div className="progress-modal__cover-placeholder">
                {book.title[0]}
              </div>
            )}
            <div>
              <h2 id="progress-modal-title" className="progress-modal__title">
                {book.title}
              </h2>
              <p className="progress-modal__author">{book.author}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="progress-modal__close"
            aria-label="Close progress tracker"
          >
            ✕
          </button>
        </div>

       
        <div className="progress-modal__ring-section">
          <ProgressArc percentage={percentage} />
          <div className="progress-modal__ring-label">
            <span className="progress-modal__percentage">{percentage}%</span>
            <span className="progress-modal__pages-summary">
              {current > 0 && total > 0
                ? `${current} of ${total} pages`
                : current > 0
                  ? `page ${current}`
                  : "Not started"}
            </span>
          </div>
        </div>

      
        <div className="progress-modal__form">
          {/* Page inputs */}
          <div className="progress-modal__row">
            <div className="progress-modal__field">
              <label htmlFor="current-page" className="progress-modal__label">
                Current page
              </label>
              <input
                id="current-page"
                type="number"
                min="0"
                max={total > 0 ? total : undefined}
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                className="progress-modal__input"
                placeholder="0"
              />
            </div>
            <div className="progress-modal__field">
              <label htmlFor="total-pages" className="progress-modal__label">
                Total pages
              </label>
              <input
                id="total-pages"
                type="number"
                min="1"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="progress-modal__input"
                placeholder="e.g. 320"
              />
            </div>
          </div>

         
          {total > 0 && (
            <div className="progress-modal__quick-set">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() =>
                    setCurrentPage(Math.round((pct / 100) * total).toString())
                  }
                  className="progress-modal__quick-btn"
                  type="button"
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

        
          <div className="progress-modal__row">
            <div className="progress-modal__field">
              <label htmlFor="started-at" className="progress-modal__label">
                Started
              </label>
              <input
                id="started-at"
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="progress-modal__input progress-modal__input--date"
              />
            </div>
            <div className="progress-modal__field">
              <label htmlFor="finished-at" className="progress-modal__label">
                Finished
              </label>
              <input
                id="finished-at"
                type="date"
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
                className="progress-modal__input progress-modal__input--date"
              />
            </div>
          </div>

         
          <div className="progress-modal__actions">
            <button
              onClick={onClose}
              className="progress-modal__btn progress-modal__btn--cancel"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={upsert.isPending}
              className="progress-modal__btn progress-modal__btn--save"
              type="button"
            >
              {upsert.isPending ? "Saving…" : "Save progress"}
            </button>
          </div>

          {upsert.isError && (
            <p className="progress-modal__error">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function ProgressArc({ percentage }: { percentage: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      className="progress-arc"
      aria-hidden="true"
    >
   
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="var(--color-surface-raised)"
        strokeWidth="10"
      />
    
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}