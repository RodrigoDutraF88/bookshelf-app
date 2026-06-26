
"use client";

import { useState } from "react";
import type { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";
import { BookCard } from "./BookCard";
import { StatusTabs } from "./StatusTabs";
import { SearchBar } from "./SearchBar";
import { EmptyState } from "./EmptyState";
import { AddBookModal } from "./AddBookModal";

type FilterStatus = BookStatus | null;

// Skeleton card for loading state — same dimensions as BookCard
function BookCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{
        backgroundColor: "var(--color-surface)",
        borderLeft: "3px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Cover placeholder */}
      <div
        className="w-full"
        style={{
          aspectRatio: "2/3",
          backgroundColor: "var(--color-surface-raised)",
        }}
      />
      {/* Text placeholders */}
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3.5 rounded" style={{ backgroundColor: "var(--color-border-hover)", width: "80%" }} />
        <div className="h-3 rounded" style={{ backgroundColor: "var(--color-border)", width: "55%" }} />
        <div className="mt-2 h-5 w-20 rounded-full" style={{ backgroundColor: "var(--color-border)" }} />
      </div>
    </div>
  );
}

export function LibraryView() {
  const [activeStatus, setActiveStatus] = useState<FilterStatus>(null);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // tRPC query — re-runs whenever activeStatus or search changes
  const { data: books, isLoading, isError, error } = api.book.getAll.useQuery({
    status:  activeStatus ?? undefined,
    search:  search || undefined,
  });

  // Compute per-status counts for the tab badges.
  // We fetch ALL books for counts (no status filter) in a separate query.
  const { data: allBooks } = api.book.getAll.useQuery({});

  const counts: Record<BookStatus, number> = {
    WANT_TO_READ:      0,
    CURRENTLY_READING: 0,
    COMPLETED:         0,
    DROPPED:           0,
  };

  allBooks?.forEach((book) => {
    counts[book.status] = (counts[book.status] ?? 0) + 1;
  });

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            My Library
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {allBooks
              ? `${allBooks.length} book${allBooks.length !== 1 ? "s" : ""} in your collection`
              : "Your personal reading collection"}
          </p>
        </div>

        {/* Add book button */}
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

      {/* ── Filters row ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Status tabs */}
        <StatusTabs
          current={activeStatus}
          onChange={setActiveStatus}
          counts={counts}
        />

        {/* Search bar — aligned right on desktop */}
        <div className="flex justify-between items-center gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
          />
          {/* Book count for current filter */}
          {books && (
            <span
              className="text-sm flex-shrink-0"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
              aria-live="polite"
            >
              {books.length} result{books.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Grid / empty / error ─────────────────────────────────── */}
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
        // Skeleton grid — same column count as the real grid
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books?.length === 0 ? (
        <EmptyState
          search={search}
          status={activeStatus}
          onAddBook={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div
          className="grid gap-4"
          style={{
            // Responsive grid: auto-fill, each card min 160px
            // → 2 cols on mobile, 3 on tablet, 4–5 on desktop
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {books?.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* ── Add book modal ───────────────────────────────────────── */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 2v12M2 8h12" />
    </svg>
  );
}