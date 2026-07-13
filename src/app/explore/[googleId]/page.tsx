"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { BookStatus } from "../../../../generated/prisma";
import { api } from "~/trpc/react";

const STATUS_OPTIONS: { value: BookStatus; label: string; color: string }[] = [
  { value: "WANT_TO_READ",      label: "Want to Read",      color: "var(--spine-want)" },
  { value: "CURRENTLY_READING", label: "Currently Reading", color: "var(--spine-reading)" },
  { value: "COMPLETED",         label: "Completed",         color: "var(--spine-completed)" },
  { value: "DROPPED",           label: "Dropped",           color: "var(--spine-dropped)" },
];

export default function ExploreBookDetailPage() {
  const params = useSearchParams();
  const router = useRouter();

  const title       = params.get("title")       ?? "";
  const author      = params.get("author")      ?? "";
  const cover       = params.get("cover")       ?? "";
  const description = params.get("description") ?? "";
  const genres      = params.get("genres")      ?? "";
  const year        = params.get("year")        ?? "";
  const isbn        = params.get("isbn")        ?? "";

  const [status, setStatus]     = useState<BookStatus>("WANT_TO_READ");
  const [added,  setAdded]      = useState(false);
  const [imgErr, setImgErr]     = useState(false);

  const utils      = api.useUtils();
  const createBook = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      setAdded(true);
    },
  });

  function handleAdd() {
    if (added) { router.push("/library"); return; }
    createBook.mutate({
      title,
      author,
      coverImage:    cover    || undefined,
      description:   description || undefined,
      genres:        genres ? genres.split(",").filter(Boolean) : [],
      publishedYear: year ? parseInt(year, 10) : undefined,
      isbn:          isbn  || undefined,
      status,
    });
  }

  const genreList = genres ? genres.split(",").filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "var(--color-bg)" }}>

      
      <div style={{ padding: "16px 16px 0" }}>
        <button
          onClick={() => router.back()}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "6px",
            background:      "none",
            border:          "none",
            cursor:          "pointer",
            color:           "var(--color-text-secondary)",
            fontSize:        "14px",
            fontFamily:      "var(--font-body)",
            padding:         "4px 0",
          }}
        >
          <BackIcon />
          Explore
        </button>
      </div>

     
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px", margin: "0 auto" }}>

       
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
         
          <div
            style={{
              width:           "110px",
              flexShrink:      0,
              aspectRatio:     "2/3",
              borderRadius:    "var(--radius-md)",
              overflow:        "hidden",
              boxShadow:       "0 8px 32px rgba(44,24,16,0.22)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            {cover && !imgErr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={title} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>📖</div>
            )}
          </div>

       
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily:   "var(--font-display)",
                fontSize:     "20px",
                color:        "var(--color-text-primary)",
                lineHeight:   1.25,
                marginBottom: "6px",
              }}
            >
              {title}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
              {author}
            </p>
            {year && (
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>{year}</p>
            )}
            {genreList.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {genreList.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    style={{
                      fontSize:        "10px",
                      padding:         "3px 8px",
                      borderRadius:    "var(--radius-pill)",
                      backgroundColor: "var(--color-accent-glass)",
                      color:           "var(--color-accent)",
                      border:          "1px solid rgba(200,135,58,0.25)",
                      fontWeight:      500,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

     
        {description && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--color-text-primary)", marginBottom: "8px" }}>
              About this book
            </h2>
            <p
              style={{
                fontSize:   "13px",
                color:      "var(--color-text-secondary)",
                lineHeight: 1.7,
                fontFamily: "var(--font-serif)",
              }}
            >
              {description}
            </p>
          </div>
        )}

        {isbn && (
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            ISBN: {isbn}
          </p>
        )}

       
        <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

        
        {!added && (
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px", fontFamily: "var(--font-body)" }}>
              Add to shelf as
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  style={{
                    display:         "flex",
                    alignItems:      "center",
                    gap:             "12px",
                    padding:         "12px 14px",
                    borderRadius:    "var(--radius-md)",
                    border:          `1.5px solid ${status === value ? color : "var(--color-border)"}`,
                    backgroundColor: status === value ? `color-mix(in srgb, ${color} 10%, transparent)` : "var(--color-surface)",
                    cursor:          "pointer",
                    textAlign:       "left",
                    transition:      "all 150ms ease",
                    width:           "100%",
                  }}
                >
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontFamily: "var(--font-body)", fontWeight: status === value ? 700 : 500, color: status === value ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                    {label}
                  </span>
                  {status === value && <CheckIcon color={color} />}
                </button>
              ))}
            </div>
          </div>
        )}

  
        <button
          onClick={handleAdd}
          disabled={createBook.isPending}
          style={{
            width:           "100%",
            padding:         "15px",
            borderRadius:    "var(--radius-lg)",
            border:          "none",
            backgroundColor: added ? "var(--color-success)" : "var(--color-accent)",
            color:           "#fff",
            fontSize:        "16px",
            fontWeight:      700,
            fontFamily:      "var(--font-body)",
            cursor:          createBook.isPending ? "not-allowed" : "pointer",
            opacity:         createBook.isPending ? 0.7 : 1,
            transition:      "all 200ms ease",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            gap:             "8px",
            boxShadow:       "0 4px 16px rgba(200,135,58,0.30)",
          }}
        >
          {createBook.isPending ? (
            "Adding…"
          ) : added ? (
            <><CheckIcon color="#fff" /> Go to Library</>
          ) : (
            <><PlusIcon /> Add to my shelf</>
          )}
        </button>

        {createBook.error && (
          <p style={{ fontSize: "13px", color: "var(--color-danger)", textAlign: "center" }}>
            {createBook.error.message}
          </p>
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>;
}
function CheckIcon({ color }: { color: string }) {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 8 6 12 14 4"/></svg>;
}