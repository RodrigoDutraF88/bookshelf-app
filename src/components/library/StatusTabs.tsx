"use client";
import type { BookStatus } from "../../../generated/prisma";

interface StatusTabsProps {
  current: BookStatus | null;
  onChange: (status: BookStatus | null) => void;
  counts: Record<BookStatus, number>;
}

const TABS: { label: string; value: BookStatus | null }[] = [
  { label: "All",              value: null },
  { label: "Reading",          value: "CURRENTLY_READING" },
  { label: "Want to Read",     value: "WANT_TO_READ" },
  { label: "Completed",        value: "COMPLETED" },
  { label: "Dropped",          value: "DROPPED" },
];

const totalCount = (counts: Record<BookStatus, number>) =>
  Object.values(counts).reduce((a, b) => a + b, 0);

export function StatusTabs({ current, onChange, counts }: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by reading status"
      style={{
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        paddingBottom: "2px",
        scrollbarWidth: "none",
      }}
    >
      {TABS.map(({ label, value }) => {
        const isActive = current === value;
        const count = value === null ? totalCount(counts) : counts[value];

        return (
          <button
            key={label}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "999px",
              border: "1.5px solid",
              borderColor: isActive
                ? "var(--color-accent)"
                : "var(--color-border)",
              backgroundColor: isActive
                ? "var(--color-accent)"
                : "var(--color-surface)",
              color: isActive
                ? "var(--color-text-inverse)"
                : "var(--color-text-secondary)",
              fontSize: "13px",
              fontWeight: isActive ? 700 : 500,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isActive ? "0 2px 8px var(--color-accent-glow)" : "none",
            }}
          >
            {label}
            {count > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(139, 99, 64, 0.12)",
                  color: isActive
                    ? "var(--color-text-inverse)"
                    : "var(--color-text-muted)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}