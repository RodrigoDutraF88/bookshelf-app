"use client";

import type { BookStatus } from "../../../generated/prisma";

// null means "show all books"
type FilterStatus = BookStatus | null;

type TabItem = {
  value: FilterStatus;
  label: string;
  count: number;
};

type Props = {
  current: FilterStatus;
  onChange: (status: FilterStatus) => void;
  counts: Record<BookStatus, number>;
};

const TAB_ORDER: { value: FilterStatus; label: string }[] = [
  { value: null,              label: "All" },
  { value: "CURRENTLY_READING", label: "Reading" },
  { value: "WANT_TO_READ",    label: "Want to Read" },
  { value: "COMPLETED",       label: "Completed" },
  { value: "DROPPED",         label: "Dropped" },
];

export function StatusTabs({ current, onChange, counts }: Props) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const tabs: TabItem[] = TAB_ORDER.map((t) => ({
    ...t,
    count: t.value === null ? totalCount : counts[t.value] ?? 0,
  }));

  return (
  
    <div
      className="flex gap-0 overflow-x-auto pb-px"
      style={{ borderBottom: "1px solid var(--color-border)" }}
      role="tablist"
      aria-label="Filter library by reading status"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === current;

        return (
          <button
            key={tab.value ?? "all"}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap flex-shrink-0 relative"
            style={{
              color: isActive
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              transition: "color var(--transition-fast)",
            
              borderBottom: isActive
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
              marginBottom: "-1px", 
            }}
          >
            {tab.label}
          
            {tab.count > 0 && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-full tabular-nums font-medium"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-accent-glass)"
                    : "var(--color-surface-raised)",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}