"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { CommandPalette } from "@/components/command-palette";
import type { ToolDefinition } from "@/lib/tools";
import { toolDefinitions } from "@/lib/tools";

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
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTool = useMemo(
    () => toolDefinitions.find((tool) => tool.id === activeToolId) ?? toolDefinitions[0],
    [activeToolId]
  );

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return toolDefinitions;
    return toolDefinitions.filter((tool) => {
      const haystack = [tool.name, tool.category, tool.headline, ...tool.keywords].join(" ");
      return haystack.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const groupedTools = useMemo(() => {
    const groups = new Map<string, ToolDefinition[]>();
    toolDefinitions.forEach((tool) => {
      if (!groups.has(tool.category)) {
        groups.set(tool.category, []);
      }
      groups.get(tool.category)!.push(tool);
    });
    return Array.from(groups.entries()).map(([category, tools]) => ({
      category,
      tools: tools.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  const containerStyle = useMemo<CSSProperties>(() => {
    const computedHeight = viewportHeight ? `${viewportHeight}px` : "100vh";
    return {
      height: computedHeight,
    };
  }, [viewportHeight]);

  const handleSelect = useCallback((toolId: string) => {
    setActiveToolId(toolId);
    setPaletteOpen(false);
    setSearchQuery("");
    setPaletteQuery("");
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setPaletteQuery(searchQuery.trim());
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setSearchQuery("");
        setPaletteQuery("");
        searchInputRef.current?.blur();
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    // Track the real viewport height so the workspace can lock to it and keep internal regions scrollable.
    const viewport = window.visualViewport;
    const updateHeight = () => {
      const height = viewport?.height ?? window.innerHeight;
      setViewportHeight(height);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    viewport?.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      viewport?.removeEventListener("resize", updateHeight);
    };
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
      style={containerStyle}
      className="flex w-full flex-col overflow-hidden rounded-b-[40px] border border-[var(--surface-border)]/80 bg-[rgba(10,12,20,0.78)] shadow-[0_40px_120px_-60px_var(--glow)] backdrop-blur-xl"
    >
      <header className="relative flex-shrink-0 overflow-hidden border-b border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.88)] px-5 py-6 shadow-[inset_0_-1px_0_rgba(88,166,255,0.08)] sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(88,166,255,0.4)] to-transparent" aria-hidden />
        <div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(88,166,255,0.18),transparent_70%)] blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-1 items-start gap-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(88,166,255,0.16)] text-base font-semibold text-[var(--accent)] transition-transform duration-300 ease-out will-change-transform hover:scale-[1.04]">
              d·
            </span>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--foreground-muted)]">
                  devtools.io
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Frictionless developer utilities, crafted for focus.
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-w-full flex-1 flex-wrap items-center justify-end gap-3 sm:min-w-[280px] lg:min-w-[320px]">
            <div className="relative flex min-w-[220px] flex-1">
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
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tools or press ⌘K"
                className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] py-3 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition focus:border-[var(--accent)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPaletteQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] p-1 text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
                  aria-label="Clear search"
                >
                  <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-lg border border-[var(--surface-border)]/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] lg:inline-flex">
                  ⌘K
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setPaletteQuery(searchQuery.trim());
                setPaletteOpen(true);
              }}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[var(--surface-border)]/70 bg-[rgba(10,12,20,0.65)] px-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--foreground-muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]"
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
              Palette
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <aside className="flex w-full flex-shrink-0 flex-col overflow-hidden border-b border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.85)] px-5 pb-6 pt-5 transition lg:w-[320px] lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-[var(--foreground-muted)] flex-shrink-0">
            <span>{searchQuery ? "Search results" : "Tool collections"}</span>
            <span className="rounded-full border border-[var(--surface-border)]/50 px-2 py-0.5 text-[10px] text-[var(--foreground-disabled)]">
              {searchQuery ? filteredTools.length : toolDefinitions.length}
            </span>
          </div>

          <div className="relative mt-6 flex-1 min-h-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[rgba(8,10,16,0.92)] via-[rgba(8,10,16,0.86)]/60 to-transparent" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[rgba(8,10,16,0.92)] via-[rgba(8,10,16,0.86)]/60 to-transparent" aria-hidden />
            <div className="scrollbar-soft flex h-full flex-col overflow-y-auto pr-1">
              {searchQuery ? (
                filteredTools.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredTools.map((tool) => {
                      const isActive = tool.id === activeTool?.id;
                      return (
                        <li key={tool.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(tool.id)}
                            className={`group flex w-full items-start gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 ${
                              isActive
                                ? "border-[var(--accent)]/70 bg-[rgba(88,166,255,0.16)] text-[var(--foreground)]"
                                : "border-transparent text-[var(--foreground-muted)] hover:-translate-y-[1px] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                            }`}
                            aria-current={isActive ? "true" : undefined}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-[var(--foreground)]">{tool.name}</span>
                              <span className="text-xs text-[var(--foreground-muted)]">{tool.category}</span>
                            </div>
                            <span
                              className={`ml-auto mt-1 inline-flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full transition ${
                                isActive
                                  ? "bg-[var(--accent)]"
                                  : "bg-[var(--surface-border)]/80 group-hover:bg-[var(--accent)]/60"
                              }`}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.6)] px-4 py-3 text-sm text-[var(--foreground-muted)]">
                    No tools match "{searchQuery}".
                  </p>
                )
              ) : (
                <div className="space-y-5">
                  {groupedTools.map(({ category, tools }) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--foreground-muted)]">
                          {category}
                        </span>
                        <span className="rounded-full border border-[var(--surface-border)]/50 px-2 py-0.5 text-[10px] text-[var(--foreground-disabled)]">
                          {tools.length}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {tools.map((tool) => {
                          const isActive = tool.id === activeTool?.id;
                          return (
                            <li key={tool.id}>
                              <button
                                type="button"
                                onClick={() => handleSelect(tool.id)}
                                className={`group flex w-full items-start gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 ${
                                  isActive
                                    ? "border-[var(--accent)]/70 bg-[rgba(88,166,255,0.16)] text-[var(--foreground)]"
                                    : "border-[var(--surface-border)]/30 bg-[var(--background-subtle)] text-[var(--foreground-muted)] hover:-translate-y-[1px] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                                }`}
                                aria-current={isActive ? "true" : undefined}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-[var(--foreground)]">{tool.name}</span>
                                  <span className="text-xs text-[var(--foreground-muted)]">{tool.headline}</span>
                                </div>
                                <span
                                  className={`ml-auto inline-flex h-2 w-2 flex-shrink-0 rounded-full transition ${
                                    isActive
                                      ? "bg-[var(--accent)]"
                                      : "bg-[var(--surface-border)]/80 group-hover:bg-[var(--accent)]/60"
                                  }`}
                                  aria-hidden
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex-shrink-0 hidden rounded-2xl border border-[var(--surface-border)]/60 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-[var(--foreground-muted)] lg:flex">
            Ctrl/⌘ + K
          </div>
        </aside>

        <main className="flex flex-1 min-h-0 flex-col overflow-hidden px-5 pb-6 pt-6 sm:px-8 lg:pt-8">
          <div className="flex-1 overflow-y-auto">
            {activeTool ? (
              <div className="space-y-6">
                <ToolHeader tool={activeTool} />
                <div className="glass-panel rounded-3xl border border-[var(--surface-border)]/50 p-6 shadow-[0_30px_120px_-90px_var(--glow)] transition-shadow duration-300">
                  <div className="flex flex-col gap-5">
                    <div className="relative rounded-2xl border border-[var(--surface-border)]/30 bg-[rgba(10,12,20,0.8)] p-4">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(88,166,255,0.2)] to-transparent" aria-hidden />
                      {activeTool.component ? (
                        <activeTool.component />
                      ) : (
                        <p className="text-sm text-[var(--foreground-muted)]">
                          Tool implementation coming soon.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">Choose a tool to begin.</p>
            )}
          </div>
        </main>
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
