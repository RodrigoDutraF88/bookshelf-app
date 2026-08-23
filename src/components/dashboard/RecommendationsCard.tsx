"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface Recommendation {
  title:  string;
  author: string;
  reason: string;
}

export function RecommendationsCard() {
  const [enabled, setEnabled] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } =
    api.ai.getRecommendations.useQuery(undefined, {
      enabled,         
      staleTime: 1000 * 60 * 10, 
      retry: false,
    });

  function handleGenerate() {
    if (enabled) {
     
      void refetch();
    } else {
      setEnabled(true);
    }
  }

  function handleRecommendationClick(rec: Recommendation) {
    const query = `${rec.title} ${rec.author}`;
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  }

  const preconditionFailed = isError && error?.data?.code === "PRECONDITION_FAILED";

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border:          "1px solid var(--color-border)",
        borderRadius:    "var(--radius-lg)",
        padding:         "24px",
        boxShadow:       "var(--shadow-sm)",
        position:        "relative",
        overflow:        "hidden",
      }}
    >
     
      <div
        style={{
          position:        "absolute",
          top:             0,
          left:            0,
          right:           0,
          height:          "3px",
          background:      "linear-gradient(to right, #4A7C59, #C8873A, #6B8FA8)",
          borderRadius:    "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      />

     
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "15px", color: "var(--color-text-primary)", marginBottom: "4px" }}>
            AI Recommendations
          </h3>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Powered by Gemini · based on your completed books
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "6px",
            padding:         "8px 16px",
            borderRadius:    "var(--radius-pill)",
            border:          "1.5px solid var(--color-accent)",
            backgroundColor: isLoading ? "var(--color-accent-glass)" : "var(--color-accent)",
            color:           isLoading ? "var(--color-accent)" : "#fff",
            fontSize:        "12px",
            fontWeight:      700,
            fontFamily:      "var(--font-body)",
            cursor:          isLoading ? "not-allowed" : "pointer",
            flexShrink:      0,
            transition:      "all 150ms ease",
            whiteSpace:      "nowrap",
          }}
        >
          {isLoading ? (
            <>
              <SpinnerIcon />
              Thinking…
            </>
          ) : data ? (
            <>
              <RefreshIcon />
              Refresh
            </>
          ) : (
            <>
              <SparkleIcon />
              Get recommendations
            </>
          )}
        </button>
      </div>

     
      {preconditionFailed && (
        <div style={{ padding: "16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-deep)", border: "1px solid var(--color-border)", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Mark at least one book as <strong>Completed</strong> to get personalised recommendations.
          </p>
        </div>
      )}

      
      {isError && !preconditionFailed && (
        <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "color-mix(in srgb, var(--color-danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)" }}>
          <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
            {error?.message ?? "Something went wrong. Try again."}
          </p>
        </div>
      )}

     
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "14px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-deep)" }}>
              <div style={{ height: "13px", width: "55%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: "11px", width: "30%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: "11px", width: "80%", borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
      )}

      
      {data && !isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.map((rec: Recommendation, i: number) => (
            <RecommendationItem
              key={i}
              rec={rec}
              index={i}
              onClick={() => handleRecommendationClick(rec)}
            />
          ))}
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "4px" }}>
            Recommendations by Google Gemini , results may vary , click a book to find it
          </p>
        </div>
      )}

     
      {!enabled && !isLoading && (
        <div
          style={{
            padding:         "32px 16px",
            textAlign:       "center",
            border:          "1.5px dashed var(--color-border)",
            borderRadius:    "var(--radius-md)",
          }}
        >
          <p style={{ fontSize: "28px", marginBottom: "10px" }}>✨</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto" }}>
            Click <strong>Get recommendations</strong> to discover 5 books picked just for you based on your reading history.
          </p>
        </div>
      )}
    </div>
  );
}


function RecommendationItem({
  rec,
  index,
  onClick,
}: {
  rec: Recommendation;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const COLORS = ["#C8873A", "#4A7C59", "#6B8FA8", "#B85450", "#8B6B8A"];
  const color  = COLORS[index % COLORS.length]!;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         "flex",
        gap:             "14px",
        padding:         "14px 16px",
        borderRadius:    "var(--radius-md)",
        backgroundColor: hovered ? "var(--color-bg-deep)" : "transparent",
        border:          `1px solid ${hovered ? "var(--color-border)" : "transparent"}`,
        transition:      "all 150ms ease",
        alignItems:      "flex-start",
        width:           "100%",
        textAlign:       "left",
        cursor:          "pointer",
        font:            "inherit",
      }}
    >
      
      <div
        style={{
          width:           "28px",
          height:          "28px",
          borderRadius:    "50%",
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          fontSize:        "12px",
          fontWeight:      700,
          flexShrink:      0,
          fontFamily:      "var(--font-display)",
          border:          `1.5px solid color-mix(in srgb, ${color} 30%, transparent)`,
        }}
      >
        {index + 1}
      </div>

      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-display)", marginBottom: "2px" }}>
          {rec.title}
        </p>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "5px" }}>
          {rec.author}
        </p>
        <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.5, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {rec.reason}
        </p>
      </div>

      
      <div
        style={{
          flexShrink: 0,
          color: "var(--color-text-muted)",
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 150ms ease",
          paddingTop: "4px",
        }}
      >
        <ChevronIcon />
      </div>
    </button>
  );
}


function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M9 2a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}