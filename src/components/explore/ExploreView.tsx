"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchGoogleBooks, type GoogleBookResult } from "~/lib/google-books";

export function ExploreView({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query,     setQuery]     = useState(initialQuery);
  const [results,   setResults]   = useState<GoogleBookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 3) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setSearchErr(false);
    setHasSearched(true);
    try {
      setResults(await searchGoogleBooks(q));
    } catch {
      setSearchErr(true);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void runSearch(query); }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 3) {
      void runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function handleBookClick(book: GoogleBookResult) {
    const params = new URLSearchParams({
      googleId:     book.googleId,
      title:        book.title,
      author:       book.author,
      cover:        book.coverImage ?? "",
      description:  book.description ?? "",
      genres:       book.genres.join(","),
      year:         book.publishedYear?.toString() ?? "",
      isbn:         book.isbn ?? "",
    });
    router.push(`/explore/${book.googleId}?${params.toString()}`);
  }

  return (
    <div style={{ padding: "20px 16px 32px", maxWidth: "760px", margin: "0 auto" }}>
      {/* Header — matches ReviewsView: plain text, no background */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontFamily:    "var(--font-body)",
            fontSize:      "clamp(26px, 5vw, 38px)",
            color:         "var(--color-text-primary)",
            letterSpacing: "-0.02em",
            marginBottom:  "6px",
          }}
        >
          Explore Books
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Search millions of books and add them to your shelf
        </p>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "28px" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }}>
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or ISBN…"
          style={{
            width:           "100%",
            padding:         "12px 40px 12px 40px",
            borderRadius:    "var(--radius-lg)",
            border:          "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            fontSize:        "15px",
            color:           "var(--color-text-primary)",
            fontFamily:      "var(--font-body)",
            outline:         "none",
            boxSizing:       "border-box",
          }}
          aria-label="Search Google Books"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px", display: "flex" }}
            aria-label="Clear search"
          >
            <XIcon />
          </button>
        )}
      </div>

      {searching && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                className="animate-pulse"
                style={{ aspectRatio: "2/3", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              />
              <div className="animate-pulse" style={{ height: "11px", width: "80%", borderRadius: "4px", backgroundColor: "var(--color-surface)" }} />
              <div className="animate-pulse" style={{ height: "10px", width: "55%", borderRadius: "4px", backgroundColor: "var(--color-surface)" }} />
            </div>
          ))}
        </div>
      )}

      {searchErr && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", gap: "12px" }}>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            Search failed
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", maxWidth: "260px", lineHeight: 1.6 }}>
            Check your connection and try again.
          </p>
        </div>
      )}

      {!searching && !searchErr && hasSearched && results.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", gap: "12px" }}>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            No results for &quot;{query}&quot;
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", maxWidth: "260px", lineHeight: 1.6 }}>
            Try a different title or author name.
          </p>
        </div>
      )}

      {!searching && results.length > 0 && (
        <>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "14px", fontFamily: "var(--font-body)" }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 "14px 12px",
            }}
          >
            {results.map((book) => (
              <ExploreBookCard key={book.googleId} book={book} onClick={() => handleBookClick(book)} />
            ))}
          </div>
        </>
      )}

      {!hasSearched && !searching && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center", gap: "12px" }}>
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" aria-hidden="true">
            {[
              { x: 8,  h: 36, c: "#4A7C59" },
              { x: 22, h: 44, c: "#C8873A" },
              { x: 36, h: 30, c: "#6B8FA8" },
              { x: 48, h: 40, c: "#B85450" },
              { x: 62, h: 34, c: "#8B6B8A" },
              { x: 76, h: 42, c: "#4A7C59" },
              { x: 90, h: 28, c: "#C8873A" },
              { x: 102,h: 38, c: "#6B8FA8" },
            ].map((b, i) => (
              <rect key={i} x={b.x} y={48 - b.h} width={12} height={b.h} rx="1.5" fill={b.c} opacity="0.5" />
            ))}
            <rect x="0" y="48" width="120" height="4" rx="1" fill="#8B6340" />
            <rect x="0" y="52" width="120" height="3" rx="1" fill="#3D2314" opacity="0.6" />
          </svg>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            Discover your next read
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", maxWidth: "260px", lineHeight: 1.6 }}>
            Search millions of books by title, author, or ISBN and add them straight to your library.
          </p>
        </div>
      )}
    </div>
  );
}


function ExploreBookCard({ book, onClick }: { book: GoogleBookResult; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        display:         "flex",
        flexDirection:   "column",
        gap:             "6px",
        background:      "none",
        border:          "none",
        cursor:          "pointer",
        textAlign:       "left",
        padding:         0,
        borderRadius:    "var(--radius-md)",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={`${book.title} by ${book.author}`}
    >
      <div
        style={{
          aspectRatio:     "2/3",
          borderRadius:    "var(--radius-md)",
          overflow:        "hidden",
          backgroundColor: "var(--color-surface)",
          border:          "1px solid var(--color-border)",
          position:        "relative",
        }}
      >
        {book.coverImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImage}
            alt={book.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width:           "100%",
              height:          "100%",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              flexDirection:   "column",
              gap:             "6px",
              padding:         "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📖</span>
            <span style={{ fontSize: "9px", color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.3, fontFamily: "var(--font-display)" }}>
              {book.title.slice(0, 30)}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "0 1px" }}>
        <p
          style={{
            fontSize:     "11px",
            fontWeight:   700,
            fontFamily:   "var(--font-display)",
            color:        "var(--color-text-primary)",
            lineHeight:   1.3,
            overflow:     "hidden",
            display:      "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginBottom: "2px",
          }}
        >
          {book.title}
        </p>
        <p
          style={{
            fontSize:     "10px",
            color:        "var(--color-text-muted)",
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {book.author}
        </p>
      </div>
    </button>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3" strokeLinecap="round"/></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/></svg>;
}