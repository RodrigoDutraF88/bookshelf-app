"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchGoogleBooks, type GoogleBookResult } from "~/lib/google-books";

export function ExploreView() {
  const router = useRouter();
  const [query,     setQuery]     = useState("");
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
    <div>
      
      <div
        style={{
          padding:      "32px 110px 24px",
          position:     "relative",
          overflow:     "hidden",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
        <h1
          style={{
            fontFamily: "var(--font-body)",
            fontSize:   "36px",
            color:      "var(--color-text-primary)",
            marginBottom: "40px"
          }}
        >
          Explore Books
        </h1>

      
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C8873A", pointerEvents: "none" }}>
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
              padding:         "13px 14px 13px 42px",
              borderRadius:    "var(--radius-lg)",
              border:          "none",
              backgroundColor: "#fff",
              fontSize:        "15px",
              color:           "var(--color-text-primary)",
              fontFamily:      "var(--font-body)",
              boxShadow:       "0 4px 20px rgba(0,0,0,0.12)",
              outline:         "none",
              boxSizing:       "border-box",
            }}
            aria-label="Search Google Books"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px" }}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      
      <div style={{ padding: "16px", minHeight: "50vh" }}>

       
        {searching && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ aspectRatio: "2/3", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "11px", width: "80%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "10px", width: "55%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        )}

        
        {searchErr && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "14px", color: "var(--color-danger)" }}>
              Search failed. Check your connection and try again.
            </p>
          </div>
        )}

        
        {!searching && !searchErr && hasSearched && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "28px", marginBottom: "12px" }}>📚</p>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              No results for &quot;{query}&quot;
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Try a different title or author name
            </p>
          </div>
        )}

       
        {!searching && results.length > 0 && (
          <>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap:                 "12px",
              }}
            >
              {results.map((book) => (
                <ExploreBookCard key={book.googleId} book={book} onClick={() => handleBookClick(book)} />
              ))}
            </div>
          </>
        )}

       
        {!hasSearched && !searching && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--color-text-primary)", marginBottom: "8px" }}>
              Discover your next read
            </p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto" }}>
              Search millions of books by title, author, or ISBN and add them straight to your library.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}


function ExploreBookCard({ book, onClick }: { book: GoogleBookResult; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        transition:      "transform 150ms ease",
        transform:       hovered ? "translateY(-3px)" : "translateY(0)",
      }}
      aria-label={`${book.title} by ${book.author}`}
    >
      
      <div
        style={{
          aspectRatio:     "2/3",
          borderRadius:    "var(--radius-md)",
          overflow:        "hidden",
          backgroundColor: "var(--color-surface-raised)",
          position:        "relative",
          boxShadow:       hovered
            ? "0 8px 24px rgba(44,24,16,0.22)"
            : "0 2px 8px rgba(44,24,16,0.12)",
          transition:      "box-shadow 150ms ease",
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
              background:      "linear-gradient(135deg, var(--color-surface-raised), var(--color-bg-deep))",
            }}
          >
            <span style={{ fontSize: "20px" }}>📖</span>
            <span style={{ fontSize: "9px", color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.3, fontFamily: "var(--font-display)" }}>
              {book.title.slice(0, 30)}
            </span>
          </div>
        )}
      </div>

  
      <div style={{ padding: "0 2px" }}>
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