"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { InteractiveStarRating } from "./InteractiveStarRating";


type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface ReviewModalProps {
  book: BookWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ book, isOpen, onClose }: ReviewModalProps) {
  const utils = api.useUtils();
  const existing = book.review;

  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  const [body, setBody] = useState(existing?.body ?? "");

  
  useEffect(() => {
    setRating(existing?.rating ?? null);
    setBody(existing?.body ?? "");
  }, [book.id, existing]);

  const upsert = api.review.upsert.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      onClose();
    },
  });

  const hasChanges =
    rating !== (existing?.rating ?? null) || body !== (existing?.body ?? "");

  const canSave = (rating !== null || body.trim().length > 0) && hasChanges;

  function handleSave() {
    if (!canSave) return;
    upsert.mutate({
      bookId: book.id,
      rating: rating ?? undefined,
      body: body.trim() || undefined,
    });
  }

 
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = !!existing;
  const bodyLength = body.length;
  const MAX_BODY = 2000;

  return (
    <>
   
      <div
        className="review-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

 
      <div
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
     
        <div className="review-modal__header">
          <div className="review-modal__book-info">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                className="review-modal__cover"
              />
            ) : (
              <div className="review-modal__cover-placeholder">
                {book.title[0]}
              </div>
            )}
            <div>
              <h2
                id="review-modal-title"
                className="review-modal__title"
              >
                {isEditing ? "Edit review" : "Write a review"}
              </h2>
              <p className="review-modal__book-name">
                {book.title}
                <span className="review-modal__book-author">
                  {" "}by {book.author}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="review-modal__close"
            aria-label="Close review"
          >
            ✕
          </button>
        </div>


        <div className="review-modal__rating-section">
          <InteractiveStarRating value={rating} onChange={setRating} />
          {rating !== null && (
            <button
              type="button"
              onClick={() => setRating(null)}
              className="review-modal__clear-rating"
            >
              Clear rating
            </button>
          )}
        </div>

       
        <div className="review-modal__divider" aria-hidden="true" />


        <div className="review-modal__body-section">
          <label
            htmlFor="review-body"
            className="review-modal__body-label"
          >
            Your thoughts <span className="review-modal__optional">(optional)</span>
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
            placeholder="What did you think? Any favourite passages, characters, or ideas?"
            className="review-modal__textarea"
            rows={5}
          />
          <p
            className="review-modal__char-count"
            aria-live="polite"
            style={{
              color:
                bodyLength > MAX_BODY * 0.9
                  ? "var(--color-danger)"
                  : "var(--color-text-muted)",
            }}
          >
            {bodyLength} / {MAX_BODY}
          </p>
        </div>

      
        <div className="review-modal__actions">
          <button
            type="button"
            onClick={onClose}
            className="review-modal__btn review-modal__btn--cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || upsert.isPending}
            className="review-modal__btn review-modal__btn--save"
          >
            {upsert.isPending
              ? "Saving…"
              : isEditing
                ? "Update review"
                : "Save review"}
          </button>
        </div>

        {upsert.isError && (
          <p className="review-modal__error" role="alert">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </>
  );
}