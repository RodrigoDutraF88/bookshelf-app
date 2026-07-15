"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";
import { SearchBar } from "./SearchBar";
import { EmptyState } from "./EmptyState";
import { AddBookModal } from "./AddBookModal";
import { BookshelfView } from "./BookshelfView";

type OrganiseMode = "all" | "category";

function ShelfRowSkeleton() {
  return (
    <div className="shelf-row">
      <div className="shelf-row__books">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse flex-shrink-0 rounded"
            style={{ width: 40, height: 160 + (i % 3) * 30, backgroundColor: "var(--color-surface-raised)", alignSelf: "flex-end" }}
          />
        ))}
      </div>
      <div className="shelf-row__ledge" />
    </div>
  );
}

export function LibraryView() {
  const router = useRouter();
  const [search, setSearch]             = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [organise, setOrganise]         = useState<OrganiseMode>("all");

  const { data: books, isLoading, isError, error } = api.book.getAll.useQuery({
    search: search || undefined,
  });

  const { data: allBooks } = api.book.getAll.useQuery({});
  const totalBooks = allBooks?.length ?? 0;

  // Books per shelf — fewer on mobile to avoid overflow
  // window is not available on SSR so we check typeof window
  const booksPerShelf =
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 12;

  return (
    <>
      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #E8A855 0%, #C8873A 100%)",
          padding:    "32px 24px 28px",
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", position: "relative" }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize:   "clamp(28px, 5vw, 40px)",
                color:      "#fff",
                lineHeight: 1.1,
                marginBottom: "8px",
                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              Your Bookshelf<br />Library
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-body)" }}>
              {isLoading ? "Loading…" : `${totalBooks} book${totalBooks !== 1 ? "s" : ""} in your collection`}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard#ai-recommendations")}
            title="AI book recommendations"
            style={{
              width: "72px", height: "72px", borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(8px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "3px", cursor: "pointer", flexShrink: 0, transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)"; }}
          >
            <StarIcon />
            <span style={{ fontSize: "8px", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
              AI recs
            </span>
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ padding: "16px 16px 12px", backgroundColor: "var(--color-bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* All / Per category toggle */}
          <div
            style={{ display: "flex", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-pill)", padding: "3px", border: "1px solid var(--color-border)", flexShrink: 0 }}
            role="group"
            aria-label="Organise by"
          >
            <button
              onClick={() => setOrganise("all")}
              aria-pressed={organise === "all"}
              style={{
                padding: "5px 12px", borderRadius: "var(--radius-pill)",
                fontSize: "12px", fontWeight: organise === "all" ? 700 : 500,
                fontFamily: "var(--font-body)", border: "none",
                backgroundColor: organise === "all" ? "var(--color-accent)" : "transparent",
                color: organise === "all" ? "#fff" : "var(--color-text-muted)",
                cursor: "pointer", transition: "all 150ms ease", whiteSpace: "nowrap",
              }}
            >
              All
            </button>
            <button
              onClick={() => setOrganise("category")}
              aria-pressed={organise === "category"}
              title="Per category"
              style={{
                padding: "5px 8px", borderRadius: "var(--radius-pill)",
                border: "none",
                backgroundColor: organise === "category" ? "var(--color-accent)" : "transparent",
                color: organise === "category" ? "#fff" : "var(--color-text-muted)",
                cursor: "pointer", transition: "all 150ms ease",
                display: "flex", alignItems: "center",
              }}
            >
              <ListIcon />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1 }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "0 16px", backgroundColor: "var(--color-bg)", minHeight: "60vh" }}>
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center" role="alert">
            <p style={{ color: "var(--color-danger)" }}>Failed to load your library</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {error?.message ?? "An unexpected error occurred. Try refreshing."}
            </p>
          </div>
        ) : isLoading ? (
          <div><ShelfRowSkeleton /><ShelfRowSkeleton /></div>
        ) : books?.length === 0 ? (
          <EmptyState onAddBook={() => setIsAddModalOpen(true)} />
        ) : (
          <BookshelfView
            books={books ?? []}
            onAddBook={() => setIsAddModalOpen(true)}
            organise={organise}
            booksPerShelf={booksPerShelf}
          />
        )}
      </div>


<div style={{
  position:        "fixed",
  bottom:          "72px",
  left:            "50%",
  transform:       "translateX(-50%)",
  zIndex:          30,
  textAlign:       "center",
  display:         "flex",
  flexDirection:   "column",
  alignItems:      "center",
}}>
        <button
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Add a book"
          style={{
            width: "52px", height: "52px", borderRadius: "50%",
            border: "2.5px solid var(--color-accent)",
            backgroundColor: "transparent", color: "var(--color-accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 200ms ease",
            boxShadow: "0 4px 16px rgba(200,135,58,0.20)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-accent)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-accent)"; }}
        >
          <PlusCircleIcon />
        </button>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "6px" }}>
          ADD BOOK
        </p>
      </div>

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}

function StarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function PlusCircleIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
}