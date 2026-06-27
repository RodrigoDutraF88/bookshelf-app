
import type { BookStatus } from "../../../generated/prisma";

type Props = {
  status: BookStatus;
  size?: "sm" | "md";
};

const STATUS_CONFIG: Record<
  BookStatus,
  { label: string; spineVar: string; textVar: string }
> = {
  WANT_TO_READ: {
    label: "Want to Read",
    spineVar: "var(--color-spine-want)",
    textVar: "var(--color-spine-want)",
  },
  CURRENTLY_READING: {
    label: "Reading",
    spineVar: "var(--color-spine-reading)",
    textVar: "var(--color-spine-reading)",
  },
  COMPLETED: {
    label: "Completed",
    spineVar: "var(--color-spine-done)",
    textVar: "var(--color-spine-done)",
  },
  DROPPED: {
    label: "Dropped",
    spineVar: "var(--color-spine-dropped)",
    textVar: "var(--color-spine-dropped)",
  },
};

export function StatusBadge({ status, size = "md" }: Props) {
  const config = STATUS_CONFIG[status];

  const paddingClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide ${paddingClass}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.spineVar} 14%, transparent)`,
        color: config.textVar,
        border: `1px solid color-mix(in srgb, ${config.spineVar} 30%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.spineVar }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

// Export config so BookCard can access the spine color directly
export { STATUS_CONFIG };