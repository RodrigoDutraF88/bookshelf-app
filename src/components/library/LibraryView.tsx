"use client";

import { useState } from "react";
import type { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";
import { StatusTabs } from "./StatusTabs";
import { SearchBar } from "./SearchBar";
import { EmptyState } from "./EmptyState";
import { AddBookModal } from "./AddBookModal";
import { BookshelfView } from "./BookshelfView";

type FilterStatus = BookStatus | null;

function ShelfRowSkeleton() {
  return (
    <div className="shelf-row">
      <div className="shelf-row__books">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse flex-shrink-0 rounded"
            style={{
              width: 40,
            
              height: 160 + (i % 3) * 30,
              backgroundColor: "var(--color-surface-raised)",
              alignSelf: "flex-end",
            }}
          />
        ))}
      </div>
      <div className="shelf-row__ledge" />
    </div>
  );
}

export function LibraryView() {
  const [activeStatus, setActiveStatus] = useState<FilterStatus>(null);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  
  const {
    data: books,
    isLoading,
    isError,
    error,
  } = api.book.getAll.useQuery({
    status: activeStatus ?? undefined,
    search: search || undefined,
  });

  
  const { data: allBooks } = api.book.getAll.useQuery({});

  const counts: Record<BookStatus, number> = {
    WANT_TO_READ: 0,
    CURRENTLY_READING: 0,
    COMPLETED: 0,
    DROPPED: 0,
  };
  allBooks?.forEach((book) => {
    counts[book.status] = (counts[book.status] ?? 0) + 1;
  });

  return (
    <>
   
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-4xl font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            My Bookshelf Library
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {allBooks
              ? `${allBooks.length} book${allBooks.length !== 1 ? "s" : ""} in your collection`
              : "Your personal reading collection"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold flex-shrink-0"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#0F0F0F",
            transition: "opacity var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <PlusIcon />
          Add book
        </button>
      </div>

    
      <div className="flex flex-col gap-4 mb-6">
        <StatusTabs
          current={activeStatus}
          onChange={setActiveStatus}
          counts={counts}
        />

        <div className="flex justify-between items-center gap-4">
          <SearchBar value={search} onChange={setSearch} />
          {books && (
            <span
              className="text-sm flex-shrink-0"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
              aria-live="polite"
            >
              {books.length} result{books.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

     
      {isError ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-20 text-center"
          role="alert"
        >
          <p style={{ color: "var(--color-danger)" }}>
            Failed to load your library
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {error?.message ?? "An unexpected error occurred. Try refreshing."}
          </p>
        </div>
      ) : isLoading ? (
      
        <div>
          <ShelfRowSkeleton />
          <ShelfRowSkeleton />
        </div>
      ) : books?.length === 0 ? (
        <EmptyState
          search={search}
          status={activeStatus}
          onAddBook={() => setIsAddModalOpen(true)}
        />
      ) : (
      
        <BookshelfView
          books={books ?? []}
          onAddBook={() => setIsAddModalOpen(true)}
        />
      )}

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8 2v12M2 8h12" />
    </svg>
  );
}