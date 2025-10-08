"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

export function GlobalSearch() {
  const [query, setQuery] = useState("");

  const dispatchSearch = useCallback((nextQuery: string, options?: { openPalette?: boolean }) => {
    window.dispatchEvent(
      new CustomEvent("toolbox:search", {
        detail: {
          query: nextQuery,
          openPalette: options?.openPalette ?? false,
        },
      })
    );
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      dispatchSearch(value);
    },
    [dispatchSearch]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        dispatchSearch(query, { openPalette: true });
      }
      if (event.key === "Escape") {
        setQuery("");
        dispatchSearch("");
      }
    },
    [dispatchSearch, query]
  );

  return (
    <div className="relative w-full max-w-xl">
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
      >
        <path
          d="m20.71 19.29-3.4-3.39A7.92 7.92 0 0 0 18 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42-1.42ZM6 11a5 5 0 1 1 5 5 5 5 0 0 1-5-5Z"
          fill="currentColor"
        />
      </svg>
      <input
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search tools instantly or hit ⌘K"
        className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] py-3 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)]/60 focus:outline-none"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-lg border border-[var(--surface-border)]/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] md:inline-flex">
        ⌘K
      </div>
    </div>
  );
}
