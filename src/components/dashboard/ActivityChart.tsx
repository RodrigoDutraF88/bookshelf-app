"use client";

interface MonthData {
  month: string;
  count: number;
}

interface ActivityChartProps {
  data:       MonthData[];
  isLoading?: boolean;
}

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
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
        Books Finished — Last 12 Months
      </h3>

      {isLoading ? (
        <div style={{ height: "120px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--color-surface-raised)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Bars */}
          <div
            style={{
              display:     "flex",
              alignItems:  "flex-end",
              gap:         "6px",
              height:      "100px",
            }}
          >
            {data.map((item) => {
              const pct     = max === 0 ? 0 : (item.count / max) * 100;
              const isEmpty = item.count === 0;
              return (
                <div
                  key={item.month}
                  title={`${item.month}: ${item.count} book${item.count !== 1 ? "s" : ""}`}
                  style={{
                    flex:            1,
                    height:          isEmpty ? "4px" : `${Math.max(pct, 8)}%`,
                    borderRadius:    "4px 4px 0 0",
                    backgroundColor: isEmpty
                      ? "rgba(139,99,64,0.1)"
                      : "var(--color-accent)",
                    transition:      "height 600ms cubic-bezier(0.34,1.2,0.64,1)",
                    cursor:          "default",
                    position:        "relative",
                  }}
                >
               
                  {item.count > 0 && (
                    <span
                      style={{
                        position:   "absolute",
                        top:        "-18px",
                        left:       "50%",
                        transform:  "translateX(-50%)",
                        fontSize:   "10px",
                        fontWeight: 700,
                        color:      "var(--color-accent)",
                        fontFamily: "var(--font-body)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

       
          <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

      
          <div style={{ display: "flex", gap: "6px" }}>
            {data.map((item) => (
              <div
                key={item.month}
                style={{
                  flex:       1,
                  textAlign:  "center",
                  fontSize:   "9px",
                  color:      "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                  overflow:   "hidden",
                }}
              >
                {item.month.split(" ")[0]}
              </div>
            ))}
          </div>
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