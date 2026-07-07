"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { Book, ReadingProgress, Review } from "../../../generated/prisma";
import { ProgressModal } from "~/components/progress/ProgressModal";
import { ReviewModal } from "~/components/reviews/ReviewModal";
import { api } from "~/trpc/react";
import { EditBookModal } from "~/components/library/EditBookModal";

type BookWithRelations = Book & {
  readingProgress: ReadingProgress | null;
  review: Review | null;
};

interface BookDetailModalProps {
  book: BookWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ:      "Want to Read",
  CURRENTLY_READING: "Reading",
  COMPLETED:         "Completed",
  DROPPED:           "Dropped",
};

const STATUS_COLORS: Record<string, string> = {
  WANT_TO_READ:      "#6B8FA8",
  CURRENTLY_READING: "#C8873A",
  COMPLETED:         "#4A7C59",
  DROPPED:           "#8B6340",
};



export function BookDetailModal({ book, isOpen, onClose }: BookDetailModalProps) {
  const [showProgress, setShowProgress]     = useState(false);
  const [showReview, setShowReview]         = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [mounted, setMounted]               = useState(false);
  const [portalEl, setPortalEl]             = useState<Element | null>(null);
  const backdropRef                         = useRef<HTMLDivElement>(null);
  const [showEdit, setShowEdit] = useState(false);

  const utils      = api.useUtils();
  const deleteBook = api.book.delete.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      onClose();
    },
  });


  useEffect(() => {
    setPortalEl(document.body);
  }, []);


  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setMounted(false);
      setConfirmDelete(false);
    }
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);


  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !portalEl) return null;

  const progress =
    book.readingProgress?.currentPage && book.readingProgress?.totalPages
      ? Math.min(100, Math.round((book.readingProgress.currentPage / book.readingProgress.totalPages) * 100))
      : null;

  const canProgress = book.status === "CURRENTLY_READING";
  const canReview   = book.status === "COMPLETED" || book.status === "DROPPED";
  const accentColor = STATUS_COLORS[book.status] ?? "#C8873A";
  const statusLabel = STATUS_LABELS[book.status] ?? book.status;

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteBook.mutate({ id: book.id });
  }

  const modal = (
    <>
      
      <div
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          9998,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          padding:         "32px 20px",
          backgroundColor: mounted ? "rgba(15, 9, 3, 0.78)" : "rgba(15, 9, 3, 0)",
          backdropFilter:  mounted ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: mounted ? "blur(8px)" : "blur(0px)",
          transition:      "background-color 280ms ease, backdrop-filter 280ms ease",
        }}
        aria-modal="true"
        role="dialog"
        aria-label={`Book details: ${book.title}`}
      >
       
        <div
          style={{
            display:       "flex",
            maxWidth:      "720px",
            width:         "100%",
            maxHeight:     "88vh",

            transform:     mounted ? "perspective(1200px) rotateY(0deg) scale(1)" : "perspective(1200px) rotateY(-8deg) scale(0.92)",
            opacity:       mounted ? 1 : 0,
            transition:    "transform 380ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
          
            filter:        "drop-shadow(0 40px 60px rgba(10,5,2,0.65)) drop-shadow(0 8px 20px rgba(10,5,2,0.4))",
          }}
        >
        
          <div
            style={{
              flex:            "0 0 260px",
              display:         "flex",
              flexDirection:   "column",
              borderRadius:    "4px 0 0 4px",
              overflow:        "hidden",
              position:        "relative",
            
              background:      "linear-gradient(160deg, #fdf8f2 0%, #f5efe6 60%, #ede3d5 100%)",

              boxShadow:       "inset -8px 0 16px rgba(60,30,10,0.18), inset 4px 0 8px rgba(255,245,230,0.4)",
            }}
          >
     
            <div
              style={{
                position:   "relative",
                width:      "100%",
                flex:       "0 0 62%",
                overflow:   "hidden",
                background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 25%, #e8ddd0) 0%, #d4c8b8 100%)`,
              }}
            >
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="260px"
                />
              ) : (
                <div
                  style={{
                    width:          "100%",
                    height:         "100%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    flexDirection:  "column",
                    gap:            "10px",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }} aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span style={{ fontSize: "13px", color: accentColor, opacity: 0.7, fontFamily: "var(--font-display)", textAlign: "center", padding: "0 16px", lineHeight: 1.3 }}>
                    {book.title}
                  </span>
                </div>
              )}

       
              <div
                style={{
                  position:        "absolute",
                  top:             "12px",
                  left:            0,
                  padding:         "4px 12px 4px 10px",
                  backgroundColor: accentColor,
                  color:           "#fff",
                  fontSize:        "10px",
                  fontWeight:      700,
                  letterSpacing:   "0.06em",
                  textTransform:   "uppercase",
                  fontFamily:      "var(--font-body)",
                  borderRadius:    "0 3px 3px 0",
                  boxShadow:       "2px 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                {statusLabel}
              </div>
            </div>


            <div
              style={{
                padding:        "16px 18px 20px",
                display:        "flex",
                flexDirection:  "column",
                gap:            "8px",
                flex:           1,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily:   "var(--font-display)",
                    fontSize:     "15px",
                    color:        "#2a1a0e",
                    lineHeight:   1.3,
                    marginBottom: "3px",
                  }}
                >
                  {book.title}
                </h2>
                <p style={{ fontSize: "12px", color: "#7a5c3a", fontStyle: "italic" }}>
                  {book.author}
                </p>
              </div>

              {book.publishedYear && (
                <p style={{ fontSize: "11px", color: "#a08060" }}>{book.publishedYear}</p>
              )}

              {book.genres.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {book.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      style={{
                        fontSize:        "10px",
                        padding:         "2px 7px",
                        borderRadius:    "999px",
                        backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                        color:           accentColor,
                        border:          `1px solid color-mix(in srgb, ${accentColor} 28%, transparent)`,
                        fontWeight:      500,
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {book.review?.rating && (
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ fontSize: "13px", color: i < (book.review?.rating ?? 0) ? "#C8873A" : "#d4c0a8" }}>
                      ★
                    </span>
                  ))}
                </div>
              )}

            
              {progress !== null && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: "#a08060" }}>Progress</span>
                    <span style={{ fontSize: "10px", color: accentColor, fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "999px", backgroundColor: "rgba(139,99,64,0.18)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, borderRadius: "999px", backgroundColor: accentColor, transition: "width 500ms ease" }} />
                  </div>
                </div>
              )}
            </div>
          </div>


          <div
            aria-hidden="true"
            style={{
              width:      "18px",
              flexShrink: 0,
              background: `linear-gradient(to right,
                rgba(30,15,5,0.55) 0%,
                rgba(80,45,20,0.35) 30%,
                rgba(160,110,60,0.25) 55%,
                rgba(220,185,140,0.15) 75%,
                rgba(245,235,220,0.05) 100%
              )`,
              boxShadow:  "inset 2px 0 4px rgba(255,240,215,0.12), inset -2px 0 8px rgba(0,0,0,0.3)",
              position:   "relative",
              display:    "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-around",
              paddingBlock: "20px",
            }}
          >
    
            {[0,1,2,3,4].map((i) => (
              <div
                key={i}
                style={{
                  width:           "5px",
                  height:          "5px",
                  borderRadius:    "50%",
                  backgroundColor: `rgba(180,130,70,0.4)`,
                  boxShadow:       "0 1px 2px rgba(0,0,0,0.3)",
                }}
              />
            ))}
          </div>

        
          <div
            style={{
              flex:           "1",
              display:        "flex",
              flexDirection:  "column",
              borderRadius:   "0 4px 4px 0",
              overflow:       "hidden",
             
              background:     "linear-gradient(170deg, #fefaf5 0%, #f8f1e8 50%, #f0e8db 100%)",
              boxShadow:      "inset 4px 0 8px rgba(255,245,225,0.5), inset -2px 0 6px rgba(60,30,10,0.08)",
              position:       "relative",
              overflowY:      "auto",
              padding:        "28px 26px 26px",
            }}
          >
    
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position:        "absolute",
                top:             "14px",
                right:           "14px",
                width:           "28px",
                height:          "28px",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                border:          "1px solid rgba(139,99,64,0.25)",
                borderRadius:    "50%",
                backgroundColor: "transparent",
                color:           "#a08060",
                cursor:          "pointer",
                transition:      "all 150ms ease",
                fontSize:        "14px",
                lineHeight:      1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(139,99,64,0.12)";
                e.currentTarget.style.color = "#2a1a0e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#a08060";
              }}
            >
              ✕
            </button>

          
            <div style={{ marginBottom: "22px", paddingRight: "32px" }}>
              <p
                style={{
                  fontSize:      "10px",
                  fontWeight:    700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "#b09070",
                  marginBottom:  "5px",
                  fontFamily:    "var(--font-body)",
                }}
              >
                What would you like to do?
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize:   "20px",
                  color:      "#2a1a0e",
                  lineHeight: 1.2,
                }}
              >
                {book.title}
              </h3>
            </div>

   
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>

              {canProgress && (
                <PageActionButton
                  icon={<BookmarkIcon />}
                  label={book.readingProgress ? "Update progress" : "Log progress"}
                  sub={progress !== null ? `${progress}% · page ${book.readingProgress?.currentPage}` : "Track your current page"}
                  color="#C8873A"
                  primary
                  onClick={() => setShowProgress(true)}
                />
              )}

              {canReview && (
                <PageActionButton
                  icon={<PenIcon />}
                  label={book.review ? "Edit your review" : "Write a review"}
                  sub={book.review?.rating ? `You rated this ${book.review.rating}/5 stars` : "Share your thoughts"}
                  color="#4A7C59"
                  onClick={() => setShowReview(true)}
                />
              )}

              <PageActionButton
                icon={<PencilIcon />}
                label="Edit book details"
                sub="Title, author, cover, genres"
                color="#6B8FA8"
                onClick={() => setShowEdit(true)}
              />

              <div style={{ borderTop: "1px dashed rgba(139,99,64,0.2)", margin: "4px 0" }} />

              <PageActionButton
                icon={<TrashIcon />}
                label={confirmDelete ? "Tap again to confirm" : "Remove from library"}
                sub={confirmDelete ? "This cannot be undone" : "Permanently delete this book"}
                color="#B85450"
                danger
                active={confirmDelete}
                disabled={deleteBook.isPending}
                onClick={handleDelete}
              />
            </div>

         
            {book.review?.body && (
              <div
                style={{
                  marginTop:   "20px",
                  paddingTop:  "16px",
                  borderTop:   "1px dashed rgba(139,99,64,0.2)",
                }}
              >
                <p
                  style={{
                    fontSize:    "11px",
                    fontFamily:  "var(--font-serif)",
                    fontStyle:   "italic",
                    color:       "#9a7a56",
                    lineHeight:  1.6,
                    display:     "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow:    "hidden",
                  }}
                >
                  {'"'}{book.review.body}{'"'}
                </p>
              </div>
            )}

      
            <p
              aria-hidden="true"
              style={{
                textAlign:  "center",
                fontSize:   "10px",
                color:      "rgba(139,99,64,0.3)",
                marginTop:  "16px",
                fontFamily: "var(--font-serif)",
                fontStyle:  "italic",
              }}
            >
           
            </p>
          </div>
        </div>
      </div>

   
      {showProgress && (
        <ProgressModal book={book} isOpen={showProgress} onClose={() => setShowProgress(false)} />
      )}
      {showReview && (
        <ReviewModal book={book} isOpen={showReview} onClose={() => setShowReview(false)} />
      )}
      {showEdit && (
        <EditBookModal
          book={book}
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );

  return createPortal(modal, portalEl);
}


interface PageActionButtonProps {
  icon:     React.ReactNode;
  label:    string;
  sub:      string;
  color:    string;
  primary?: boolean;
  danger?:  boolean;
  active?:  boolean;
  disabled?: boolean;
  onClick:  () => void;
}

function PageActionButton({ icon, label, sub, color, primary, danger, active, disabled, onClick }: PageActionButtonProps) {
  const [hov, setHov] = useState(false);

  const bg = (hov || active)
    ? danger
      ? "#B85450"
      : primary
        ? color
        : `color-mix(in srgb, ${color} 14%, transparent)`
    : `color-mix(in srgb, ${color} 7%, transparent)`;

  const textColor = (hov || active) && (danger || primary) ? "#fff" : (hov ? "#2a1a0e" : "#5a3e28");
  const subColor  = (hov || active) && (danger || primary) ? "rgba(255,255,255,0.75)" : "#a08060";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:         "flex",
        alignItems:      "center",
        gap:             "14px",
        padding:         "12px 15px",
        borderRadius:    "6px",
        border:          `1.5px solid color-mix(in srgb, ${color} ${(hov || active) ? "40%" : "20%"}, transparent)`,
        backgroundColor: bg,
        cursor:          disabled ? "not-allowed" : "pointer",
        textAlign:       "left",
        width:           "100%",
        opacity:         disabled ? 0.55 : 1,
        transition:      "all 150ms ease",
      }}
    >
      <span style={{ color: (hov || active) && (danger || primary) ? "#fff" : color, flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-body)", color: textColor, transition: "color 150ms ease" }}>
          {label}
        </span>
        <span style={{ fontSize: "11px", color: subColor, transition: "color 150ms ease" }}>
          {sub}
        </span>
      </span>
    </button>
  );
}


function BookmarkIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.8.4L8 13.1l-5.2 2.8A.5.5 0 0 1 2 15.5V2z"/></svg>;
}
function PenIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function PencilIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.7 1.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9 9a1 1 0 0 1-.5.3l-3 .7a.5.5 0 0 1-.6-.6l.7-3a1 1 0 0 1 .3-.5l9-9z"/></svg>;
}
function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5.5 1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zM2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1H13l-.8 8a2 2 0 0 1-2 1.8H5.8a2 2 0 0 1-2-1.8L3 4.5H2.5A.5.5 0 0 1 2 4z"/></svg>;
}