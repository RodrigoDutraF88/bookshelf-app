
import type { BookStatus } from "../../../generated/prisma";

type Props = {
  search?: string;
  status?: BookStatus | null;
  onAddBook?: () => void;
};

type EmptyConfig = {
  icon: string;
  heading: string;
  body: string;
  ctaLabel: string;
};

function getConfig(search?: string, status?: BookStatus | null): EmptyConfig {
  if (search) {
    return {
      icon: "🔍",
      heading: "No books found",
      body: `Nothing in your library matches "${search}". Try a different title or author.`,
      ctaLabel: "Clear search",
    };
  }

  if (status === "CURRENTLY_READING") {
    return {
      icon: "📖",
      heading: "Nothing in progress",
      body: "Move a book from your want-to-read list or add a new one you've started.",
      ctaLabel: "Add a book",
    };
  }

  if (status === "WANT_TO_READ") {
    return {
      icon: "📚",
      heading: "Your reading list is empty",
      body: "Add books you're excited to read. Your backlog starts here.",
      ctaLabel: "Add a book",
    };
  }

  if (status === "COMPLETED") {
    return {
      icon: "✓",
      heading: "No completed books yet",
      body: "Every book you finish will live here. Your reading history starts with the first one.",
      ctaLabel: "Mark a book as completed",
    };
  }

  if (status === "DROPPED") {
    return {
      icon: "—",
      heading: "No dropped books",
      body: "Books you've set aside without finishing will appear here. No judgment.",
      ctaLabel: "Browse your library",
    };
  }

  // Default: library is completely empty
  return {
    icon: "◆",
    heading: "Your library is empty",
    body: "Add the first book to your collection. Search by title, paste a cover URL, or enter it manually.",
    ctaLabel: "Add your first book",
  };
}

export function EmptyState({ search, status, onAddBook }: Props) {
  const config = getConfig(search, status);

  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-20 px-8 text-center"
      role="status"
      aria-live="polite"
    >
     
      <span
        className="text-4xl select-none"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-muted)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      >
        {config.icon}
      </span>

      <div className="flex flex-col gap-2 max-w-[320px]">
        <h3
          className="text-base font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {config.heading}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {config.body}
        </p>
      </div>

      {onAddBook && (
        <button
          onClick={onAddBook}
          className="px-5 py-2.5 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#0F0F0F",
            transition: "opacity var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {config.ctaLabel}
        </button>
      )}
    </div>
  );
}