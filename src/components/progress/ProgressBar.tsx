"use client";

interface ProgressBarProps {
  currentPage: number;
  totalPages: number | null;
  compact?: boolean;
}

export function ProgressBar({
  currentPage,
  totalPages,
  compact = false,
}: ProgressBarProps) {
  const percentage =
    totalPages && totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : null;

  if (compact) {
    return (
      <div className="progress-bar-compact">
        <div className="progress-bar-compact__track">
          <div
            className="progress-bar-compact__fill"
            style={{ width: `${percentage ?? 0}%` }}
            role="progressbar"
            aria-valuenow={percentage ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percentage ?? 0}% complete`}
          />
        </div>
        <span className="progress-bar-compact__label">
          {percentage !== null
            ? `${percentage}%`
            : `p. ${currentPage}`}
        </span>
      </div>
    );
  }

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__label">Reading progress</span>
        <span className="progress-bar__percentage">
          {percentage !== null ? `${percentage}%` : `Page ${currentPage}`}
        </span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage ?? 0}%` }}
          role="progressbar"
          aria-valuenow={percentage ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percentage ?? 0}% read`}
        />
      </div>
      {totalPages && (
        <span className="progress-bar__pages">
          {currentPage} of {totalPages} pages
        </span>
      )}
    </div>
  );
}