"use client";

interface GenreBar {
  genre: string;
  count: number;
}

interface GenreChartProps {
  data:       GenreBar[];
  isLoading?: boolean;
}

const BAR_COLORS = [
  "#C8873A", "#4A7C59", "#6B8FA8", "#B85450",
  "#8B6B8A", "#7A8C5B", "#5B7A8C", "#8C6B3E",
];

export function GenreChart({ data, isLoading }: GenreChartProps) {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
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
          marginBottom: "20px",
        }}
      >
        Genre Breakdown
      </h3>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ height: "12px", width: `${40 + i * 10}%`, borderRadius: "4px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: "10px", borderRadius: "999px", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", textAlign: "center", padding: "24px 0" }}>
          Add genres to your books to see the breakdown.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {data.map((item, i) => {
            const color = BAR_COLORS[i % BAR_COLORS.length]!;
            const pct   = Math.round((item.count / max) * 100);
            return (
              <div key={item.genre} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize:   "13px",
                      fontWeight: 500,
                      color:      "var(--color-text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.genre}
                  </span>
                  <span
                    style={{
                      fontSize:   "12px",
                      color:      "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.count} {item.count === 1 ? "book" : "books"}
                  </span>
                </div>
                <div
                  style={{
                    height:          "8px",
                    borderRadius:    "999px",
                    backgroundColor: "rgba(139,99,64,0.1)",
                    overflow:        "hidden",
                  }}
                >
                  <div
                    style={{
                      height:          "100%",
                      width:           `${pct}%`,
                      borderRadius:    "999px",
                      backgroundColor: color,
                      transition:      "width 700ms cubic-bezier(0.34, 1.2, 0.64, 1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}