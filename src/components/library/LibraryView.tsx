"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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


  const [booksPerShelf, setBooksPerShelf] = useState(20);

  useEffect(() => {
    const update = () => {
      setBooksPerShelf(window.innerWidth < 900 ? 5 : 20);
    };

    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      
      <div
        style={{
          background: "linear-gradient(135deg, #E8A855 0%, #C8873A 100%)",
          padding:    "30px 24px 28px",
          position:   "relative",
          overflow:   "hidden",
        }}
      >

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", position: "relative" }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-body)",
                fontSize:   "clamp(40px, 8vw, 55px)",
                color:      "#fff",
                lineHeight: 1.1,
                marginBottom: "3px",
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
              width:           "92px",
              height:          "92px",
              borderRadius:    "50%",
              marginRight:      "20px",
              background:      "rgba(255,255,255,0.15)",
              border:          "1.5px solid rgba(255,255,255,0.45)",
              backdropFilter:  "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "center",
              justifyContent:  "center",
              gap:             "4px",
              cursor:          "pointer",
              flexShrink:      0,
              transition:      "all 220ms ease",
              boxShadow:       "0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            <GeminiIcon />
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em" }}>
              AI RECS
            </span>
          </button>
        </div>
      </div>


      <div style={{ padding: "16px 16px 12px", backgroundColor: "var(--color-bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      
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

     
          <div style={{ flex: 1 }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

   
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
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function PlusCircleIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
}

function GeminiIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    
      <path
        d="M16 2 C16 2 18 10 18 16 C18 22 16 30 16 30 C16 30 14 22 14 16 C14 10 16 2 16 2Z"
        fill="white"
      />
     
      <path
        d="M2 16 C2 16 10 18 16 18 C22 18 30 16 30 16 C30 16 22 14 16 14 C10 14 2 16 2 16Z"
        fill="white"
      />
  
      <circle cx="16" cy="16" r="2" fill="white"/>
    </svg>
  );
}