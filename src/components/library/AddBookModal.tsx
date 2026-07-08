"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";
import { searchGoogleBooks, type GoogleBookResult } from "~/lib/google-books";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "WANT_TO_READ",      label: "Want to Read" },
  { value: "CURRENTLY_READING", label: "Currently Reading" },
  { value: "COMPLETED",         label: "Completed" },
  { value: "DROPPED",           label: "Dropped" },
];

type Tab = "search" | "manual";

export function AddBookModal({ isOpen, onClose }: Props) {
  const utils = api.useUtils();

  
  const [tab, setTab] = useState<Tab>("search");

  
  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState<GoogleBookResult[]>([]);
  const [searching,  setSearching]  = useState(false);
  const [searchErr,  setSearchErr]  = useState(false);
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const [title,         setTitle]         = useState("");
  const [author,        setAuthor]        = useState("");
  const [coverImage,    setCoverImage]    = useState("");
  const [description,   setDescription]  = useState("");
  const [genres,        setGenres]        = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [isbn,          setIsbn]          = useState("");
  const [status,        setStatus]        = useState<BookStatus>("WANT_TO_READ");
  const [coverPreviewError, setCoverPreviewError] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef  = useRef<HTMLInputElement>(null);

  const createBook = api.book.create.useMutation({
    onSuccess: () => { void utils.book.getAll.invalidate(); handleClose(); },
  });

  
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && isOpen) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        (tab === "search" ? searchInputRef : firstInputRef).current?.focus();
      }, 50);
    }
  }, [isOpen, tab]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 3) { setResults([]); return; } 
    setSearching(true);
    setSearchErr(false);
    try {
      const data = await searchGoogleBooks(q);
      setResults(data);
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

  
  function fillFromResult(book: GoogleBookResult) {
    setTitle(book.title);
    setAuthor(book.author);
    setCoverImage(book.coverImage ?? "");
    setDescription(book.description ?? "");
    setGenres(book.genres.join(", "));
    setPublishedYear(book.publishedYear?.toString() ?? "");
    setIsbn(book.isbn ?? "");
    setCoverPreviewError(false);
    setTab("manual"); 
  }

 
  function handleClose() {
    setTab("search");
    setQuery(""); setResults([]); setSearching(false); setSearchErr(false);
    setTitle(""); setAuthor(""); setCoverImage(""); setDescription("");
    setGenres(""); setPublishedYear(""); setIsbn(""); setStatus("WANT_TO_READ");
    setCoverPreviewError(false);
    onClose();
  }

 
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    createBook.mutate({
      title:         title.trim(),
      author:        author.trim(),
      coverImage:    coverImage.trim() || undefined,
      description:   description.trim() || undefined,
      genres:        genres.split(",").map((g) => g.trim()).filter(Boolean),
      publishedYear: publishedYear ? parseInt(publishedYear, 10) : undefined,
      isbn:          isbn.trim() || undefined,
      status,
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl"
        style={{
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-modal)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
       
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0"
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            zIndex: 1,
          }}
        >
          <h2
            id="add-book-title"
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Add a book
          </h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

    
        <div
          className="flex gap-1 px-6 pt-4"
          role="tablist"
          aria-label="Add book method"
        >
          {(["search", "manual"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              style={{
                padding:         "6px 16px",
                borderRadius:    "var(--radius-pill)",
                fontSize:        "13px",
                fontWeight:      tab === t ? 700 : 500,
                fontFamily:      "var(--font-body)",
                border:          "1.5px solid",
                borderColor:     tab === t ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: tab === t ? "var(--color-accent)" : "transparent",
                color:           tab === t ? "#fff" : "var(--color-text-secondary)",
                cursor:          "pointer",
                transition:      "all 150ms ease",
              }}
            >
              {t === "search" ? "🔍 Search" : "✏️ Manual"}
            </button>
          ))}
        </div>

       
        {tab === "search" && (
          <div className="flex flex-col gap-3 p-6">
        
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)", pointerEvents: "none",
                }}
              >
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN…"
                className={inputClass}
                style={{ paddingLeft: "38px" }}
                aria-label="Search Google Books"
              />
            </div>


            {searching && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: 44, height: 60, borderRadius: 4, backgroundColor: "var(--color-surface-raised)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 13, width: "70%", borderRadius: 4, backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: 11, width: "40%", borderRadius: 4, backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchErr && (
              <p style={{ fontSize: "13px", color: "var(--color-danger)", textAlign: "center", padding: "16px 0" }}>
                Search failed. Check your connection and try again.
              </p>
            )}

            {!searching && !searchErr && query && results.length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", textAlign: "center", padding: "16px 0" }}>
                No results for &quot;{query}&quot;. Try a different title or author.
              </p>
            )}

            {!searching && results.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {results.map((book) => (
                  <button
                    key={book.googleId}
                    onClick={() => fillFromResult(book)}
                    style={{
                      display:         "flex",
                      alignItems:      "center",
                      gap:             "12px",
                      padding:         "10px 8px",
                      borderRadius:    "var(--radius-md)",
                      border:          "none",
                      backgroundColor: "transparent",
                      cursor:          "pointer",
                      textAlign:       "left",
                      width:           "100%",
                      transition:      "background-color 120ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-deep)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >

                    <div style={{ width: 44, height: 60, borderRadius: 4, overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-surface-raised)", position: "relative" }}>
                      {book.coverImage ? (

                        <img src={book.coverImage} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                          <BookIcon />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                        {book.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {book.author}{book.publishedYear ? ` · ${book.publishedYear}` : ""}
                      </p>
                      {book.genres.length > 0 && (
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: 2 }}>
                          {book.genres.slice(0, 2).join(", ")}
                        </p>
                      )}
                    </div>

                    <span style={{ color: "var(--color-text-muted)", flexShrink: 0, fontSize: 16 }}>→</span>
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center", padding: "20px 0" }}>
                Search powered by Google Books · or switch to Manual to enter details yourself
              </p>
            )}
          </div>
        )}


        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">

            <div className="flex gap-4 items-start">
              <div
                className="flex-shrink-0 w-20 rounded-md overflow-hidden"
                style={{ aspectRatio: "2/3", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}
              >
                {coverImage && !coverPreviewError ? (

                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={() => setCoverPreviewError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--color-text-muted)" }} aria-hidden="true">
                    <BookIcon />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <Field label="Title" required>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Name of the Wind"
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Author" required>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Patrick Rothfuss"
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <Field label="Cover image URL">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => { setCoverImage(e.target.value); setCoverPreviewError(false); }}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)} className={inputClass}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief synopsis or your own notes…"
                rows={3}
                className={inputClass + " resize-none"}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Genres" hint="Comma-separated">
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Fantasy, Fiction"
                  className={inputClass}
                />
              </Field>
              <Field label="Published year">
                <input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  placeholder="2007"
                  min={0}
                  max={new Date().getFullYear()}
                  className={inputClass + " font-mono"}
                />
              </Field>
            </div>

            <Field label="ISBN" hint="Optional">
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0-7564-0407-1"
                className={inputClass + " font-mono"}
              />
            </Field>

            {createBook.error && (
              <p
                className="text-sm px-3 py-2 rounded-md"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-danger) 12%, transparent)",
                  color: "var(--color-danger)",
                  border: "1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)",
                }}
                role="alert"
              >
                {createBook.error.message}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBook.isPending || !title.trim() || !author.trim()}
                className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                style={{ backgroundColor: "var(--color-accent)", color: "#0F0F0F" }}
              >
                {createBook.isPending ? "Adding…" : "Add book"}
              </button>
            </div>
          </form>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
}


function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {label}
        {required && <span style={{ color: "var(--color-accent)" }} aria-hidden="true"> *</span>}
        {hint && <span className="ml-1.5 font-normal" style={{ color: "var(--color-text-muted)" }}>({hint})</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = [
  "w-full px-3 py-2 rounded-md text-sm outline-none",
  "bg-[var(--color-surface-raised)]",
  "border border-[var(--color-border)]",
  "text-[var(--color-text-primary)]",
  "placeholder:text-[var(--color-text-muted)]",
  "focus:border-[var(--color-accent)]",
  "transition-colors duration-150",
].join(" ");

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>;
}
function BookIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" /></svg>;
}