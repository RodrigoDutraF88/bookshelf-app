"use client";

import Image from "next/image";
import { api } from "~/trpc/react";
import { StatCard } from "./StatCard";
import { GenreChart } from "./GenreChart";
import { ActivityChart } from "./ActivityChart";
import { RecommendationsCard } from "./RecommendationsCard";

export function DashboardView() {
  const { data: stats, isLoading, isError } = api.book.getStats.useQuery();

  const avgRatingDisplay = stats?.avgRating != null
    ? stats.avgRating.toFixed(1)
    : "—";

  const avgRatingSub = stats?.avgRating != null
    ? `across ${stats.recentlyCompleted.length > 0 ? "rated" : "0"} books`
    : "no ratings yet";

  if (isError) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-danger)" }}>
        Failed to load dashboard. Try refreshing.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

     
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize:   "36px",
            color:      "var(--color-text-primary)",
            lineHeight: 1.1,
          }}
        >
          Your Reading Dashboard
        </h1>
        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--color-text-muted)" }}>
          {isLoading
            ? "Loading your stats…"
            : stats
              ? `${stats.total} book${stats.total !== 1 ? "s" : ""} in your collection`
              : "Your reading life at a glance"}
        </p>
      </div>

     
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap:                 "16px",
        }}
      >
        <StatCard
          label="Total Books"
          value={isLoading ? "…" : (stats?.total ?? 0)}
          icon={<LibraryIcon />}
          accent="var(--color-accent)"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed"
          value={isLoading ? "…" : (stats?.completed ?? 0)}
          sub={stats ? `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}% of library` : undefined}
          icon={<CheckIcon />}
          accent="var(--color-success)"
          isLoading={isLoading}
        />
        <StatCard
          label="Reading Now"
          value={isLoading ? "…" : (stats?.currentlyReading ?? 0)}
          icon={<BookOpenIcon />}
          accent="var(--spine-reading)"
          isLoading={isLoading}
        />
        <StatCard
          label="Want to Read"
          value={isLoading ? "…" : (stats?.wantToRead ?? 0)}
          icon={<BookmarkIcon />}
          accent="var(--spine-want)"
          isLoading={isLoading}
        />
        <StatCard
          label="Pages Read"
          value={isLoading ? "…" : stats?.pagesRead.toLocaleString() ?? 0}
          sub="across all books"
          icon={<PagesIcon />}
          accent="#8B6B8A"
          isLoading={isLoading}
        />
        <StatCard
          label="Avg Rating"
          value={isLoading ? "…" : avgRatingDisplay}
          sub={avgRatingSub}
          icon={<StarIcon />}
          accent="#C8873A"
          isLoading={isLoading}
        />
      </div>

      
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:                 "16px",
        }}
      >
        <ActivityChart data={stats?.monthly ?? []} isLoading={isLoading} />
        <GenreChart    data={stats?.genreDistribution ?? []} isLoading={isLoading} />
      </div>

    
      {(isLoading || (stats?.recentlyCompleted.length ?? 0) > 0) && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border:          "1px solid var(--color-border)",
            borderRadius:    "var(--radius-lg)",
            padding:         "24px",
            boxShadow:       "var(--shadow-sm)",
          }}
        >
          
          <h3
            style={{
              fontFamily:   "var(--font-display)",
              fontSize:     "15px",
              color:        "var(--color-text-primary)",
              marginBottom: "18px",
            }}
          >
            Recently Finished
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "14px",
                      padding:      "12px 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ width: 36, height: 52, borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ height: 13, width: "60%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: 11, width: "40%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  </div>
                ))
              : stats?.recentlyCompleted.map((book, i) => (
                  <div
                    key={book.id}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "14px",
                      padding:      "12px 0",
                      borderBottom: i < stats.recentlyCompleted.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    }}
                  >
        
                    <div
                      style={{
                        width:           36,
                        height:          52,
                        borderRadius:    "4px",
                        overflow:        "hidden",
                        flexShrink:      0,
                        backgroundColor: "var(--color-surface-raised)",
                        position:        "relative",
                      }}
                    >
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="36px"
                        />
                      ) : (
                        <div
                          style={{
                            width:          "100%",
                            height:         "100%",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            backgroundColor: "var(--color-accent-glass)",
                          }}
                        >
                          <span style={{ fontSize: "14px", fontFamily: "var(--font-display)", color: "var(--color-accent)" }}>
                            {book.title[0]}
                          </span>
                        </div>
                      )}
                    </div>

         
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily:   "var(--font-display)",
                          fontSize:     "13px",
                          color:        "var(--color-text-primary)",
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}
                      >
                        {book.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        {book.author}
                      </p>
                    </div>
                    

                  
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                      {book.rating && (
                        <div style={{ display: "flex", gap: "1px" }}>
                          {Array.from({ length: 5 }, (_, s) => (
                            <span key={s} style={{ fontSize: "11px", color: s < book.rating! ? "#C8873A" : "#d4c0a8" }}>★</span>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {new Date(book.finishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  
                  
                ))}
                
          </div>
        </div>
      )}
      <div id="ai-recommendations">
        <RecommendationsCard />

      </div>
      

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}


function LibraryIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="4" height="18" rx="1"/><rect x="9" y="7" width="4" height="14" rx="1"/><rect x="15" y="5" width="4" height="16" rx="1"/><line x1="3" y1="21" x2="21" y2="21"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
}
function BookOpenIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function BookmarkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function PagesIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}