"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { api } from "~/trpc/react";
import type { Session } from "next-auth";

export function ProfileView({ user }: { user: Session["user"] }) {
  const { data: books, isLoading } = api.book.getAll.useQuery({});

  const stats = (() => {
    if (!books) return null;
    const total      = books.length;
    const completed  = books.filter((b) => b.status === "COMPLETED").length;
    const reading    = books.filter((b) => b.status === "CURRENTLY_READING").length;
    const wantToRead = books.filter((b) => b.status === "WANT_TO_READ").length;
    const dropped    = books.filter((b) => b.status === "DROPPED").length;
    const pagesRead  = books.reduce((s, b) => s + (b.readingProgress?.currentPage ?? 0), 0);

    const ratings = books.map((b) => b.review?.rating).filter((r): r is number => r != null);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

    const reviewed = books.filter((b) => b.review?.rating != null || b.review?.body).length;

    const genreMap: Record<string, number> = {};
    books.forEach((b) => b.genres.forEach((g) => { genreMap[g] = (genreMap[g] ?? 0) + 1; }));
    const topGenre = Object.entries(genreMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    return { total, completed, reading, wantToRead, dropped, pagesRead, avgRating, reviewed, topGenre };
  })();

  const joinDate = (user as { createdAt?: string }).createdAt
    ? new Date((user as { createdAt: string }).createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const statCards = stats
    ? [
        { label: "Total books",   value: stats.total,                    emoji: "📚" },
        { label: "Completed",     value: stats.completed,                emoji: "✅" },
        { label: "Reading now",   value: stats.reading,                  emoji: "📖" },
        { label: "Want to read",  value: stats.wantToRead,               emoji: "🔖" },
        { label: "Pages read",    value: stats.pagesRead.toLocaleString(), emoji: "📄" },
        { label: "Reviews",       value: stats.reviewed,                 emoji: "✍️" },
        ...(stats.avgRating ? [{ label: "Avg rating", value: `${stats.avgRating} ★`, emoji: "⭐" }] : []),
        ...(stats.topGenre  ? [{ label: "Top genre",  value: stats.topGenre,          emoji: "🏷️" }] : []),
      ]
    : [];

  const breakdown = stats
    ? [
        { label: "Completed",   count: stats.completed,  color: "var(--spine-completed)" },
        { label: "Reading",     count: stats.reading,    color: "var(--spine-reading)" },
        { label: "Want",        count: stats.wantToRead, color: "var(--spine-want)" },
        { label: "Dropped",     count: stats.dropped,    color: "var(--spine-dropped)" },
      ].filter((s) => s.count > 0)
    : [];

  return (
    <div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "28px",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          aria-hidden="true"
          style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.06, pointerEvents: "none" }}
          width="200" height="80" viewBox="0 0 200 80" fill="none"
        >
          {[
            { x: 10, h: 48, c: "#4A7C59" }, { x: 26, h: 60, c: "#C8873A" },
            { x: 42, h: 40, c: "#6B8FA8" }, { x: 56, h: 54, c: "#B85450" },
            { x: 72, h: 44, c: "#4A7C59" }, { x: 86, h: 58, c: "#C8873A" },
            { x: 102,h: 36, c: "#8B6B8A" }, { x: 116,h: 50, c: "#6B8FA8" },
            { x: 130,h: 46, c: "#B85450" }, { x: 146,h: 62, c: "#4A7C59" },
            { x: 162,h: 38, c: "#C8873A" }, { x: 176,h: 52, c: "#6B8FA8" },
          ].map((b, i) => (
            <rect key={i} x={b.x} y={65 - b.h} width={14} height={b.h} rx="2" fill={b.c} />
          ))}
          <rect x="0" y="65" width="200" height="6" rx="1" fill="#8B6340" />
          <rect x="0" y="71" width="200" height="4" rx="1" fill="#3D2314" />
        </svg>

        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={72}
            height={72}
            style={{
              borderRadius: "50%",
              border: "3px solid var(--color-accent)",
              flexShrink: 0,
              boxShadow: "0 4px 12px var(--color-accent-glow)",
            }}
          />
        ) : (
          <div
            style={{
              width: 72, height: 72,
              borderRadius: "50%",
              border: "3px solid var(--color-accent)",
              backgroundColor: "var(--color-accent-glass)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              color: "var(--color-accent)",
              flexShrink: 0,
            }}
          >
            {(user.name ?? user.email ?? "?")[0]?.toUpperCase()}
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "4px",
            }}
          >
            {user.name ?? "Reader"}
          </h1>
          {user.email && (
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
              {user.email}
            </p>
          )}
          {joinDate && (
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
              Reading since {joinDate}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: "96px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-surface)",
              }}
            />
          ))}
        </div>
      ) : stats && stats.total > 0 ? (
        <>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "14px",
            }}
          >
            Reading Stats
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {statCards.map(({ label, value, emoji }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  boxShadow: "var(--shadow-xs)",
                  transition: "box-shadow 150ms ease, transform 150ms ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "var(--shadow-md)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "var(--shadow-xs)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>{emoji}</p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    color: "var(--color-accent)",
                    lineHeight: 1,
                    marginBottom: "4px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>

          {breakdown.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                boxShadow: "var(--shadow-xs)",
                marginBottom: "28px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: "14px",
                }}
              >
                Collection breakdown
              </p>
              <div
                style={{
                  display: "flex",
                  height: "10px",
                  borderRadius: "var(--radius-pill)",
                  overflow: "hidden",
                  gap: "2px",
                  marginBottom: "14px",
                }}
              >
                {breakdown.map(({ count, color }) => (
                  <div
                    key={color}
                    style={{ flex: count, backgroundColor: color, borderRadius: "var(--radius-pill)" }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {breakdown.map(({ label, count, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        width: 9, height: 9,
                        borderRadius: "50%",
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {label} ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: "28px" }}>
          Add some books to see your stats.
        </p>
      )}

  
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "14px",
          }}
        >
          Account
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            gap:              "8px",
            width:            "100%",
            padding:          "12px",
            borderRadius:     "var(--radius-md)",
            border:           "1.5px solid var(--color-danger)",
            backgroundColor:  "transparent",
            color:            "var(--color-danger)",
            fontSize:         "14px",
            fontWeight:       700,
            fontFamily:       "var(--font-body)",
            cursor:           "pointer",
            transition:       "all 150ms ease",
          }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}