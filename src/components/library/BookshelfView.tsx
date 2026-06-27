"use client";

import type { Book, ReadingProgress } from "../../../generated/prisma";
import { useState } from "react";
import { BookshelfRow } from "./BookshelfRow";
import { BookCard } from "./BookCard"; 

type BookWithProgress = Book & {
  readingProgress: ReadingProgress | null;
};

const BOOKS_PER_SHELF = 10;

type ViewMode = "shelf" | "grid";

interface BookshelfViewProps {
  books: BookWithProgress[];
  onAddBook?: () => void;
}

export function BookshelfView({ books, onAddBook }: BookshelfViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");

 
  const shelves: BookWithProgress[][] = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }

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

  return (
    <div className="bookshelf-view">
   
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
    
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="3" height="12" rx="1" fill="currentColor" />
              <rect x="5" y="5" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="9" y="2" width="3" height="13" rx="1" fill="currentColor" />
              <rect x="13" y="4" width="3" height="11" rx="1" fill="currentColor" />
              <rect x="0" y="15" width="18" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`bookshelf-view__toggle-btn${viewMode === "grid" ? " bookshelf-view__toggle-btn--active" : ""}`}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
          >
         
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor" />
              <rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === "shelf" ? (
        <div className="bookshelf-view__shelves">
          {shelves.map((row, idx) => (
            <BookshelfRow key={idx} books={row} />
          ))}
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