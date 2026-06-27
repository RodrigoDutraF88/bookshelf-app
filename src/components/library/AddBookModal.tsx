
"use client";

import { useEffect, useRef, useState } from "react";
import { BookStatus } from "../../../generated/prisma";
import { api } from "~/trpc/react";

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

export function AddBookModal({ isOpen, onClose }: Props) {
  const utils = api.useUtils();

  // Form state
  const [title,         setTitle]         = useState("");
  const [author,        setAuthor]        = useState("");
  const [coverImage,    setCoverImage]    = useState("");
  const [description,   setDescription]  = useState("");
  const [genres,        setGenres]        = useState("");  // comma-separated
  const [publishedYear, setPublishedYear] = useState("");
  const [isbn,          setIsbn]          = useState("");
  const [status,        setStatus]        = useState<BookStatus>("WANT_TO_READ");

 
  const [coverPreviewError, setCoverPreviewError] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const createBook = api.book.create.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
      handleClose();
    },
  });

  
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);


  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleClose() {
    // Reset form
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
    // Backdrop
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
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

      
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">

      
          <div className="flex gap-4 items-start">
       
            <div
              className="flex-shrink-0 w-20 rounded-md overflow-hidden"
              style={{
                aspectRatio: "2/3",
                backgroundColor: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
              }}
            >
              {coverImage && !coverPreviewError ? (
                
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={() => setCoverPreviewError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-hidden="true"
                >
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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
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
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0F0F0F",
              }}
            >
              {createBook.isPending ? "Adding…" : "Add book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-xs font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-accent)" }} aria-hidden="true"> *</span>
        )}
        {hint && (
          <span
            className="ml-1.5 font-normal"
            style={{ color: "var(--color-text-muted)" }}
          >
            ({hint})
          </span>
        )}
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
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}