"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface CommandItem {
  id: string;
  name: string;
  category: string;
  headline?: string;
  keywords?: string[];
  description?: string;
}

interface CommandPaletteProps {
  open: boolean;
  items: CommandItem[];
  onClose: () => void;
  onSelect: (id: string) => void;
  initialQuery?: string;
}

export function CommandPalette({ open, items, onClose, onSelect, initialQuery }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery ?? "");
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
        if (initialQuery) {
          inputRef.current?.select();
        }
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [initialQuery, open]);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const normalized = query.toLowerCase();
    return items.filter((item) => {
      const haystack = [item.name, item.category, item.headline, ...(item.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [items, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-10 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-3xl border border-[var(--surface-border)]/80 bg-[rgba(11,13,18,0.96)] p-6 shadow-[0_40px_120px_-40px_var(--glow)]"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] px-4 py-2">
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[var(--foreground-muted)]"
          >
            <path
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.93.93l.27.28v.79l4.99 4.98a1 1 0 0 0 1.41-1.41L15.5 14Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
              fill="currentColor"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools or actions"
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)]"
          />
          <kbd className="rounded-lg border border-[var(--surface-border)]/60 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-[var(--foreground-muted)]">
            Esc
          </kbd>
        </div>
        <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--surface-border)]/60 px-4 py-6 text-center text-sm text-[var(--foreground-muted)]">
              No tools match "{query}" yet. Try a broader keyword.
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className="w-full rounded-2xl border border-transparent bg-[var(--background-subtle)] px-4 py-3 text-left transition hover:border-[var(--accent)]/60 hover:bg-[rgba(88,166,255,0.12)]"
              >
                <div className="flex items-center justify-between text-sm text-[var(--foreground)]">
                  <span className="font-medium">{item.name}</span>
                  <span className="rounded-full border border-[var(--surface-border)]/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                    {item.category}
                  </span>
                </div>
                {item.headline ? (
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">{item.headline}</p>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
