"use client";

interface StatCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  icon:       React.ReactNode;
  accent?:    string;
  isLoading?: boolean;
}

export function StatCard({ label, value, sub, icon, accent = "var(--color-accent)", isLoading }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border:          "1px solid var(--color-border)",
        borderRadius:    "var(--radius-lg)",
        padding:         "20px 22px",
        display:         "flex",
        flexDirection:   "column",
        gap:             "12px",
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
          backgroundColor: accent,
          borderRadius:    "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      />

      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           "32px",
            height:          "32px",
            borderRadius:    "var(--radius-sm)",
            backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
            color:           accent,
            flexShrink:      0,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize:   "12px",
            fontWeight: 600,
            color:      "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      </div>

     
      {isLoading ? (
        <div
          style={{
            height:          "36px",
            width:           "60%",
            borderRadius:    "var(--radius-sm)",
            backgroundColor: "var(--color-surface-raised)",
            animation:       "pulse 1.5s ease-in-out infinite",
          }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize:   "32px",
              color:      "var(--color-text-primary)",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {sub && (
            <span
              style={{
                fontSize:   "12px",
                color:      "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}