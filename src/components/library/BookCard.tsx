"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma"; 
import { StatusBadge, STATUS_CONFIG } from "../../components/ui/StatusBadge";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { StarRating } from "../../components/ui/StarRating";
import { ProgressBar } from "../../components/progress/ProgressBar";
import { ProgressModal } from "../../components/progress/ProgressModal";
import { api } from "~/trpc/react";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

type Props = {
  book: BookWithRelations;
  onDeleted?: () => void;
};

export function BookCard({ book, onDeleted }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const utils = api.useUtils();

  const deleteBook = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
      onDeleted?.();
    },
  });

  const progress =
    book.readingProgress?.currentPage && book.readingProgress?.totalPages
      ? Math.round(
          (book.readingProgress.currentPage / book.readingProgress.totalPages) *
            100,
        )
      : null;

  const spineColor = STATUS_CONFIG[book.status].spineVar;

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteBook.mutate({ id: book.id });
  }

  return (
    <>
      <Link
        href={`/library/${book.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setConfirmDelete(false);
        }}
      >
        <article
          className="relative flex flex-col h-full rounded-lg overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            borderLeft: `3px solid ${spineColor}`,
            boxShadow: isHovered
              ? "var(--shadow-card-hover)"
              : "var(--shadow-card)",
            transition:
              "box-shadow var(--transition-base), transform var(--transition-base)",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
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
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
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
                  style={{
                    fontFamily: "var(--font-display)",
                    color: spineColor,
                    opacity: 0.5,
                    textShadow: `0 2px 8px color-mix(in srgb, ${spineColor} 30%, transparent)`,
                  }}
                >
                  {book.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

         
            {book.status === "CURRENTLY_READING" && progress !== null && (
              <div
                className="absolute bottom-2 right-2 rounded-full p-0.5"
                style={{
                  backgroundColor: "rgba(15,15,15,0.85)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <ProgressRing percentage={progress} size={38} />
              </div>
            )}

          
            <div
              className="absolute inset-0 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(2px)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity var(--transition-fast)",
              }}
              aria-hidden={!isHovered}
            >
             
              {book.status === "CURRENTLY_READING" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowProgress(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-bg)",
                  }}
                  aria-label={`Update progress for ${book.title}`}
                >
                  <BookmarkIcon />
                  Progress
                </button>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                 
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border-hover)",
                }}
                aria-label={`Edit ${book.title}`}
              >
                <PencilIcon />
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteBook.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: confirmDelete
                    ? "var(--color-danger)"
                    : "var(--color-surface-raised)",
                  color: confirmDelete ? "#fff" : "var(--color-danger)",
                  border: `1px solid ${confirmDelete ? "var(--color-danger)" : "color-mix(in srgb, var(--color-danger) 40%, transparent)"}`,
                  transition: "all var(--transition-fast)",
                }}
                aria-label={
                  confirmDelete
                    ? "Click again to confirm deletion"
                    : `Delete ${book.title}`
                }
              >
                <TrashIcon />
                {deleteBook.isPending
                  ? "Deleting…"
                  : confirmDelete
                    ? "Sure?"
                    : "Delete"}
              </button>
            </div>
          </div>

         
          <div className="flex flex-col gap-2 p-3 flex-1">
            <h3
              className="text-sm font-semibold leading-snug line-clamp-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              {book.title}
            </h3>

            <p
              className="text-xs leading-none"
              style={{ color: "var(--color-text-muted)" }}
            >
              {book.author}
            </p>

            {book.review?.rating && (
              <StarRating rating={book.review.rating} size="sm" />
            )}

            <div className="mt-auto pt-2">
              <StatusBadge status={book.status} size="sm" />
            </div>

          
            {book.status === "CURRENTLY_READING" &&
              book.readingProgress?.currentPage != null && (
                <ProgressBar
                  currentPage={book.readingProgress.currentPage}
                  totalPages={book.readingProgress.totalPages ?? null}
                  compact
                />
              )}
          </div>
        </article>
      </Link>

      
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

function BookmarkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.8.4L8 13.1l-5.2 2.8A.5.5 0 0 1 2 15.5V2z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.7 1.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9 9a1 1 0 0 1-.5.3l-3 .7a.5.5 0 0 1-.6-.6l.7-3a1 1 0 0 1 .3-.5l9-9z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5.5 1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zM2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1H13l-.8 8a2 2 0 0 1-2 1.8H5.8a2 2 0 0 1-2-1.8L3 4.5H2.5A.5.5 0 0 1 2 4z" />
    </svg>
  );
}