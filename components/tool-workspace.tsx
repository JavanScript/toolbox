"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommandPalette } from "@/components/command-palette";
import type { ToolDefinition } from "@/lib/tools";
import { toolDefinitions } from "@/lib/tools";

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function ToolHeader({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--surface-border)]/50 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-[var(--foreground)]">{tool.name}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">{tool.description}</p>
        </div>
        <span className="rounded-full border border-[var(--surface-border)]/60 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-[var(--foreground-muted)]">
          {tool.category}
        </span>
      </div>
    </div>
  );
}

export function ToolWorkspace() {
  const [activeToolId, setActiveToolId] = useState<string>(toolDefinitions[0]?.id ?? "");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteQuery, setPaletteQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTool = useMemo(
    () => toolDefinitions.find((tool) => tool.id === activeToolId) ?? toolDefinitions[0],
    [activeToolId]
  );

  const categories = useMemo(
    () => dedupe(toolDefinitions.map((tool) => tool.category)),
    []
  );

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return toolDefinitions;
    return toolDefinitions.filter((tool) => {
      const haystack = [tool.name, tool.category, tool.headline, ...tool.keywords].join(" ");
      return haystack.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const handleSelect = useCallback((toolId: string) => {
    setActiveToolId(toolId);
    setPaletteOpen(false);
    setSearchQuery("");
    setPaletteQuery("");
  }, []);

  useEffect(() => {
    function handleExternalSearch(event: Event) {
      const customEvent = event as CustomEvent<{ query?: string; openPalette?: boolean }>;
      const { query = "", openPalette = false } = customEvent.detail ?? {};
      setSearchQuery(query);
      if (openPalette) {
        setPaletteQuery(query);
        setPaletteOpen(true);
      } else {
        setPaletteOpen(false);
        setPaletteQuery("");
      }
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.addEventListener("toolbox:search", handleExternalSearch);
    return () => window.removeEventListener("toolbox:search", handleExternalSearch);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-[620px] w-full flex-col overflow-hidden rounded-3xl border border-[var(--surface-border)]/80 bg-[rgba(10,12,20,0.72)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.85)] p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tools, categories, or keywords"
              className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] py-3 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              setPaletteQuery("");
              setPaletteOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground-muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]"
          >
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--accent)]"
            >
              <path d="M18 18v-6h-2v4h-4v2h6Zm-8-8V4H8v4H4v2h6Z" fill="currentColor" />
            </svg>
            Command palette
            <span className="rounded-md border border-[var(--surface-border)]/70 px-2 py-0.5 text-[10px] tracking-[0.3em] text-[var(--foreground-muted)]">
              ⌘K
            </span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const isActiveCategory = activeTool?.category === category;
            return (
              <button
                key={category}
                onClick={() => {
                  const firstMatch = toolDefinitions.find((tool) => tool.category === category);
                  if (firstMatch) {
                    handleSelect(firstMatch.id);
                  }
                }}
                className={`rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.35em] transition ${
                  isActiveCategory
                    ? "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.18)] text-[var(--foreground)]"
                    : "border-[var(--surface-border)]/50 bg-[var(--background-subtle)] text-[var(--foreground-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        {searchQuery ? (
          <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.6)] p-4">
            {filteredTools.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className={`flex flex-col rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 ${
                      tool.id === activeTool?.id
                        ? "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.18)] text-[var(--foreground)]"
                        : "border-[var(--surface-border)]/40 bg-[var(--background-subtle)] text-[var(--foreground-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-[var(--foreground)]">{tool.name}</span>
                    <span className="mt-1 text-xs text-[var(--foreground-muted)]">{tool.headline}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">No tools match "{searchQuery}" yet.</p>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="flex-1 overflow-y-auto">
          {activeTool ? (
            <div className="space-y-6">
              <ToolHeader tool={activeTool} />
              <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[var(--background-subtle)] p-6">
                {activeTool.component ? (
                  <activeTool.component />
                ) : (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Tool implementation coming soon.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">Choose a tool to begin.</p>
          )}
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        items={toolDefinitions.map((tool) => ({
          id: tool.id,
          name: tool.name,
          category: tool.category,
          headline: tool.headline,
          keywords: tool.keywords,
        }))}
        onClose={() => setPaletteOpen(false)}
        onSelect={handleSelect}
        initialQuery={paletteQuery.trim()}
      />
    </div>
  );
}
