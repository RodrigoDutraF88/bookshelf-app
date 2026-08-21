
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by title or author…",
}: Props) {
 
  const [raw, setRaw] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    setRaw(value);
  }, [value]);

  
  useEffect(() => {
    const id = setTimeout(() => {
      if (raw !== value) onChange(raw);
    }, 300);
    return () => clearTimeout(id);
  }, [raw, value, onChange]);

  function handleClear() {
    setRaw("");
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div
      className="relative flex items-center"
      style={{
      
        width: "100%",
        maxWidth: "1300px",
      }}
    >
     
      <span
        className="absolute left-3 pointer-events-none"
        style={{
          color: isFocused ? "var(--color-accent)" : "var(--color-text-muted)",
          transition: "color var(--transition-fast)",
        }}
        aria-hidden="true"
      >
        <SearchIcon />
      </span>

      <input
        ref={inputRef}
        type="search"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 text-sm rounded-lg outline-none"
        style={{
          backgroundColor: "var(--color-surface)",
          border: `1px solid ${isFocused ? "var(--color-accent)" : "var(--color-border)"}`,
          color: "var(--color-text-primary)",
          transition: "border-color var(--transition-fast)",
          WebkitAppearance: "none",
        }}
        aria-label="Search your library"
      />

      {raw && (
        <button
          onClick={handleClear}
          className="absolute right-3 flex items-center justify-center rounded"
          style={{ color: "var(--color-text-muted)" }}
          aria-label="Clear search"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}