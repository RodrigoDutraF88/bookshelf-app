"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import Image from "next/image";


type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface ProgressModalProps {
  book: BookWithRelations;
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const upsertProgress = api.progress.upsert.useMutation();

  // Used when the user hits 100% — marks the book completed
  const updateStatus = api.book.update.useMutation();

  const current = parseInt(currentPage, 10) || 0;
  const total = parseInt(totalPages, 10) || 0;
  const percentage =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const isComplete = total > 0 && current >= total;

  async function handleSubmit() {
    if (current < 0) return;

    const today = new Date().toISOString().split("T")[0]!;

    // Upsert progress first
    await upsertProgress.mutateAsync({
      bookId: book.id,
      currentPage: current,
      totalPages: total > 0 ? total : undefined,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      // Auto-set finishedAt to today when completing
      finishedAt: isComplete
        ? (finishedAt ? new Date(finishedAt) : new Date(today))
        : finishedAt
          ? new Date(finishedAt)
          : undefined,
    });

    
    if (isComplete && book.status !== "COMPLETED") {
      await updateStatus.mutateAsync({
        id: book.id,
        status: "COMPLETED",
      });
    }

    await utils.book.getAll.invalidate();
    onClose();
  }

  const isPending = upsertProgress.isPending || updateStatus.isPending;
  const isError = upsertProgress.isError || updateStatus.isError;

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
              <Image
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                width={48}
                height={64}
                className="progress-modal__cover"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="progress-modal__cover-placeholder">
                {book.title[0]}
              </div>
            )}
            <div>
              <h2
                id="progress-modal-title"
                className="progress-modal__title"
              >
                {book.title}
              </h2>
              <p className="progress-modal__author">{book.author}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="progress-modal__close"
            aria-label="Close"
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
            {/* Completion notice */}
            {isComplete && book.status !== "COMPLETED" && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--spine-completed)",
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                ✓ Will mark as Completed
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="progress-modal__form">
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
              disabled={isPending}
              className="progress-modal__btn progress-modal__btn--save"
              type="button"
            >
              {isPending
                ? "Saving…"
                : isComplete && book.status !== "COMPLETED"
                  ? "Complete book ✓"
                  : "Save progress"}
            </button>
          </div>

          {isError && (
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
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      className="progress-arc"
      aria-hidden="true"
    >
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="10"
      />
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke={percentage >= 100 ? "var(--spine-completed)" : "var(--color-accent)"}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease" }}
      />
    </svg>
  );
}