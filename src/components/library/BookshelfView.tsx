"use client";

import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { useState } from "react";
import { BookCard } from "./BookCard";
import { BookSpine } from "./BookSpine";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

type ViewMode    = "shelf" | "grid";
type OrganiseMode = "all" | "category";

const BOOKS_PER_SHELF = 12;

const CATEGORY_CONFIG: { status: Book["status"]; label: string; color: string }[] = [
  { status: "CURRENTLY_READING", label: "Currently Reading", color: "var(--spine-reading)" },
  { status: "WANT_TO_READ",      label: "Want to Read",      color: "var(--spine-want)" },
  { status: "COMPLETED",         label: "Completed",         color: "var(--spine-completed)" },
  { status: "DROPPED",           label: "Dropped",           color: "var(--spine-dropped)" },
];

interface BookshelfViewProps {
  books:       BookWithRelations[];
  onAddBook?:  () => void;
  organise:    OrganiseMode;
}

export function BookshelfView({ books, onAddBook, organise }: BookshelfViewProps) {
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


      {organise === "all" && (
        viewMode === "shelf" ? (
          <ShelfRows books={books} />
        ) : (
          <div className="bookshelf-view__grid">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )
      )}

 
      {organise === "category" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "8px" }}>
          {CATEGORY_CONFIG.map(({ status, label, color }) => {
            const categoryBooks = books.filter((b) => b.status === status);
            return (
              <div key={status}>
           
                <div
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "8px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width:           "10px",
                      height:          "10px",
                      borderRadius:    "50%",
                      backgroundColor: color,
                      flexShrink:      0,
                    }}
                  />
                  <span
                    style={{
                      fontSize:      "12px",
                      fontWeight:    700,
                      fontFamily:    "var(--font-body)",
                      color:         "var(--color-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize:        "11px",
                      color:           "var(--color-text-muted)",
                      backgroundColor: "var(--color-surface)",
                      border:          "1px solid var(--color-border)",
                      borderRadius:    "var(--radius-pill)",
                      padding:         "1px 7px",
                    }}
                  >
                    {categoryBooks.length}
                  </span>
                </div>

     
                {categoryBooks.length === 0 ? (
                  <div
                    style={{
                      height:          "80px",
                      border:          "1.5px dashed var(--color-border)",
                      borderRadius:    "var(--radius-md)",
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      No books here yet
                    </p>
                  </div>
                ) : viewMode === "shelf" ? (
                  <ShelfRows books={categoryBooks} compact />
                ) : (
                  <div className="bookshelf-view__grid">
                    {categoryBooks.map((book) => <BookCard key={book.id} book={book} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function ShelfRows({ books, compact = false }: { books: BookWithRelations[]; compact?: boolean }) {
  const shelves: BookWithRelations[][] = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }

  return (
    <div className="bookshelf-view__shelves">
      {shelves.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="shelf-row"
          style={compact ? { marginBottom: "4px" } : undefined}
        >
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
}


function ShelfIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1" y="3" width="3" height="12" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="13" rx="1" fill="currentColor"/><rect x="13" y="4" width="3" height="11" rx="1" fill="currentColor"/><rect x="0" y="15" width="18" height="2" rx="1" fill="currentColor"/></svg>;
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="1" width="7" height="7" rx="1" fill="currentColor"/><rect x="1" y="10" width="7" height="7" rx="1" fill="currentColor"/><rect x="10" y="10" width="7" height="7" rx="1" fill="currentColor"/></svg>;
}