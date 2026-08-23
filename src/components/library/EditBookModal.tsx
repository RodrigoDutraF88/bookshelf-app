"use client";

import { useEffect, useRef, useState } from "react";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import type { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";
import { searchGoogleBooks, type GoogleBookResult } from "~/lib/google-books";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

type Props = {
  book: BookWithRelations;
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

export function EditBookModal({ book, isOpen, onClose }: Props) {
  const utils = api.useUtils();

  const [tab, setTab] = useState<Tab>("manual"); // default to manual — fields pre-filled

  
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<GoogleBookResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(false);
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const [title,         setTitle]         = useState(book.title);
  const [author,        setAuthor]        = useState(book.author);
  const [coverImage,    setCoverImage]    = useState(book.coverImage ?? "");
  const [description,   setDescription]  = useState(book.description ?? "");
  const [genres,        setGenres]        = useState(book.genres.join(", "));
  const [publishedYear, setPublishedYear] = useState(book.publishedYear?.toString() ?? "");
  const [isbn,          setIsbn]          = useState(book.isbn ?? "");
  const [status,        setStatus]        = useState<BookStatus>(book.status);
  const [coverPreviewError, setCoverPreviewError] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    setTitle(book.title);
    setAuthor(book.author);
    setCoverImage(book.coverImage ?? "");
    setDescription(book.description ?? "");
    setGenres(book.genres.join(", "));
    setPublishedYear(book.publishedYear?.toString() ?? "");
    setIsbn(book.isbn ?? "");
    setStatus(book.status);
    setCoverPreviewError(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]); 

  const updateBook = api.book.update.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      onClose();
    },
  });

  
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && isOpen) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  
  useEffect(() => {
    if (tab !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!query.trim() || query.trim().length < 3) { setResults([]); return; }
      setSearching(true); setSearchErr(false);
      void searchGoogleBooks(query)
        .then((data) => setResults(data))
        .catch(() => setSearchErr(true))
        .finally(() => setSearching(false));
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, tab]);

  
  function fillFromResult(result: GoogleBookResult) {
    setTitle(result.title);
    setAuthor(result.author);
    setCoverImage(result.coverImage ?? "");
    setDescription(result.description ?? "");
    setGenres(result.genres.join(", "));
    setPublishedYear(result.publishedYear?.toString() ?? "");
    setIsbn(result.isbn ?? "");
    setCoverPreviewError(false);
    setTab("manual");
  }


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    updateBook.mutate({
      id:            book.id,
      title:         title.trim(),
      author:        author.trim(),
      coverImage:    coverImage.trim() || null,
      description:   description.trim() || null,
      genres:        genres.split(",").map((g) => g.trim()).filter(Boolean),
      publishedYear: publishedYear ? parseInt(publishedYear, 10) : null,
      isbn:          isbn.trim() || null,
      status,
    });
  }

  if (!isOpen) return null;

  return (

    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-book-title"
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
          style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", zIndex: 1 }}
        >
          <div>
            <h2 id="edit-book-title" className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
              Edit book
            </h2>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 2 }}>
              {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

    
        <div className="flex gap-1 px-6 pt-4" role="tablist">
          {(["manual", "search"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 16px", borderRadius: "var(--radius-pill)",
                fontSize: "13px", fontWeight: tab === t ? 700 : 500,
                fontFamily: "var(--font-body)", border: "1.5px solid",
                borderColor: tab === t ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: tab === t ? "var(--color-accent)" : "transparent",
                color: tab === t ? "#fff" : "var(--color-text-secondary)",
                cursor: "pointer", transition: "all 150ms ease",
              }}
            >
              {t === "search" ? "🔍 Replace with search" : "✏️ Edit fields"}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <div className="flex flex-col gap-3 p-6">
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Search Google Books to replace this book&apos;s metadata. Your status and progress won&apos;t change.
            </p>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }}>
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or author…"
                className={inputClass}
                style={{ paddingLeft: 38 }}
                autoFocus
              />
            </div>

            {searching && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, height: 60, borderRadius: 4, backgroundColor: "var(--color-surface-raised)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 13, width: "70%", borderRadius: 4, backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: 11, width: "40%", borderRadius: 4, backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchErr && <p style={{ fontSize: 13, color: "var(--color-danger)", textAlign: "center" }}>Search failed. Try again.</p>}

            {!searching && results.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {results.map((r) => (
                  <button key={r.googleId} onClick={() => fillFromResult(r)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: "var(--radius-md)", border: "none", backgroundColor: "transparent", cursor: "pointer", textAlign: "left", width: "100%", transition: "background-color 120ms ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-deep)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ width: 44, height: 60, borderRadius: 4, overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-surface-raised)" }}>
                      {r.coverImage
                        
                        ? <img src={r.coverImage} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}><BookIcon /></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{r.title}</p>
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.author}{r.publishedYear ? ` · ${r.publishedYear}` : ""}</p>
                    </div>
                    <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

    
        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-20 rounded-md overflow-hidden" style={{ aspectRatio: "2/3", backgroundColor: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}>
                {coverImage && !coverPreviewError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" onError={() => setCoverPreviewError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--color-text-muted)" }}><BookIcon /></div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <Field label="Title" required>
                  <input ref={firstInputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Author" required>
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className={inputClass} />
                </Field>
              </div>
            </div>

            <Field label="Cover image URL">
              <input type="url" value={coverImage} onChange={(e) => { setCoverImage(e.target.value); setCoverPreviewError(false); }} placeholder="https://…" className={inputClass} />
            </Field>

            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)} className={inputClass}>
                {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </Field>

            <Field label="Description">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass + " resize-none"} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Genres" hint="Comma-separated">
                <input type="text" value={genres} onChange={(e) => setGenres(e.target.value)} placeholder="Fantasy, Fiction" className={inputClass} />
              </Field>
              <Field label="Published year">
                <input type="number" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} min={0} max={new Date().getFullYear()} className={inputClass + " font-mono"} />
              </Field>
            </div>

            <Field label="ISBN" hint="Optional">
              <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} className={inputClass + " font-mono"} />
            </Field>

            {updateBook.error && (
              <p className="text-sm px-3 py-2 rounded-md" style={{ backgroundColor: "color-mix(in srgb, var(--color-danger) 12%, transparent)", color: "var(--color-danger)", border: "1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)" }} role="alert">
                {updateBook.error.message}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                Cancel
              </button>
              <button type="submit" disabled={updateBook.isPending || !title.trim() || !author.trim()} className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40" style={{ backgroundColor: "var(--color-accent)", color: "#0F0F0F" }}>
                {updateBook.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
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

const inputClass = ["w-full px-3 py-2 rounded-md text-sm outline-none","bg-[var(--color-surface-raised)]","border border-[var(--color-border)]","text-[var(--color-text-primary)]","placeholder:text-[var(--color-text-muted)]","focus:border-[var(--color-accent)]","transition-colors duration-150"].join(" ");

function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>; }
function BookIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" /></svg>; }