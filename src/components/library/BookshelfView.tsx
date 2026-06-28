"use client";

import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { useState } from "react";
import { BookCard } from "./BookCard"; 
import { BookSpine } from "./BookSpine";


type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

type ViewMode = "shelf" | "grid";

const BOOKS_PER_SHELF = 12;

const STATUS_SHELF_LABELS: Record<string, string> = {
  CURRENTLY_READING: "Currently Reading",
  WANT_TO_READ:      "Want to Read",
  COMPLETED:         "Completed",
  DROPPED:           "Dropped",
};

// Status display order
const STATUS_ORDER = [
  "CURRENTLY_READING",
  "WANT_TO_READ",
  "COMPLETED",
  "DROPPED",
] as const;

interface BookshelfViewProps {
  books: BookWithRelations[];
  onAddBook?: () => void;
}

export function BookshelfView({ books, onAddBook }: BookshelfViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");

  if (books.length === 0) {
    return (
      <div className="bookshelf-empty">
        <p className="bookshelf-empty__message">Your shelf is empty.</p>
        {onAddBook && (
          <button onClick={onAddBook} className="bookshelf-empty__cta">
            Add your first book
          </button>
        )}
      </div>
    );
  }

 
  const grouped = STATUS_ORDER.reduce<Record<string, BookWithRelations[]>>(
    (acc, status) => {
      const booksForStatus = books.filter((b) => b.status === status);
      if (booksForStatus.length > 0) acc[status] = booksForStatus;
      return acc;
    },
    {},
  );

  return (
    <div className="bookshelf-view">
      {/* Toolbar */}
      <div className="bookshelf-view__toolbar">
        <span className="bookshelf-view__count">
          {books.length} {books.length === 1 ? "book" : "books"}
        </span>
        <div className="bookshelf-view__toggle" role="group" aria-label="View mode">
          <button
            onClick={() => setViewMode("shelf")}
            className={`bookshelf-view__toggle-btn${viewMode === "shelf" ? " bookshelf-view__toggle-btn--active" : ""}`}
            aria-pressed={viewMode === "shelf"}
            title="Shelf view"
          >
            <ShelfIcon />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`bookshelf-view__toggle-btn${viewMode === "grid" ? " bookshelf-view__toggle-btn--active" : ""}`}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
          >
            <GridIcon />
          </button>
        </div>
      </div>

      {viewMode === "shelf" ? (
        <div className="bookshelf-view__shelves">
          {Object.entries(grouped).map(([status, statusBooks]) => {
  
            const rows: BookWithRelations[][] = [];
            for (let i = 0; i < statusBooks.length; i += BOOKS_PER_SHELF) {
              rows.push(statusBooks.slice(i, i + BOOKS_PER_SHELF));
            }

            return (
              <div key={status} style={{ marginBottom: "8px" }}>
                {rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="shelf-row">
          
                    {rowIdx === 0 && (
                      <p className="shelf-row__label">
                        {STATUS_SHELF_LABELS[status]}
                      </p>
                    )}
                    <div className="shelf-row__books">
                      {row.map((book, bookIdx) => (
                        <BookSpine
                          key={book.id}
                          book={book}
                          index={rowIdx * BOOKS_PER_SHELF + bookIdx}
                        />
                      ))}
                    </div>
                    <div className="shelf-row__ledge" aria-hidden="true" />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bookshelf-view__grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShelfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="5" y="5" width="3" height="10" rx="1" fill="currentColor" />
      <rect x="9" y="2" width="3" height="13" rx="1" fill="currentColor" />
      <rect x="13" y="4" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="0" y="15" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}