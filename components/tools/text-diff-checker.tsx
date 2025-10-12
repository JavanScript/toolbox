"use client";

import { useMemo } from "react";
import type { Change } from "diff";
import { diffLines } from "diff";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface TextDiffState {
  original: string;
  modified: string;
  ignoreWhitespace: boolean;
  viewMode: "unified" | "split";
}

const SAMPLE_ORIGINAL = `Devtools.io accelerates developer workflows.
It keeps every tool local-first for privacy.
Enjoy a curated suite of converters and generators.`;

const SAMPLE_MODIFIED = `Devtools.io supercharges developer workflows.
It keeps each tool entirely client-side for privacy.
Explore a curated suite of converters, generators, and inspectors.`;

export function TextDiffChecker() {
  const { value, setValue, reset } = useLocalStorage<TextDiffState>("tool-text-diff", {
    original: SAMPLE_ORIGINAL,
    modified: SAMPLE_MODIFIED,
    ignoreWhitespace: false,
    viewMode: "unified",
  });
  const { notify } = useToast();

  const diff = useMemo<Change[]>(
    () => diffLines(value.original, value.modified, { ignoreWhitespace: value.ignoreWhitespace }) as Change[],
    [value.ignoreWhitespace, value.modified, value.original]
  );

  const added = diff.reduce<number>((count, part) => (part.added ? count + (part.count ?? 0) : count), 0);
  const removed = diff.reduce<number>((count, part) => (part.removed ? count + (part.count ?? 0) : count), 0);

  const handleReset = () => {
    reset();
    notify("Text diff checker reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Original</span>
            <CopyButton value={value.original} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.original}
            onChange={(event) => setValue({ ...value, original: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Original text"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Modified</span>
            <CopyButton value={value.modified} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.modified}
            onChange={(event) => setValue({ ...value, modified: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Modified text"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.6)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
        <span>removed: <span className="font-semibold text-red-300 normal-case">{removed}</span></span>
        <span>added: <span className="font-semibold text-green-300 normal-case">{added}</span></span>
        <label className="ml-auto flex items-center gap-2 normal-case">
          <input
            type="checkbox"
            checked={value.ignoreWhitespace}
            onChange={(event) => setValue({ ...value, ignoreWhitespace: event.target.checked })}
            className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-[var(--foreground)]">Ignore whitespace</span>
        </label>
        <div className="flex gap-2 normal-case">
          <button
            type="button"
            onClick={() => setValue({ ...value, viewMode: "unified" })}
            className={`rounded-2xl border px-3 py-1 text-xs uppercase tracking-[0.3em] transition ${{
              true: "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.16)] text-[var(--foreground)]",
              false: "border-[var(--surface-border)]/50 text-[var(--foreground-muted)] hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]",
            }[String(value.viewMode === "unified") as "true" | "false"]}`}
          >
            Unified
          </button>
          <button
            type="button"
            onClick={() => setValue({ ...value, viewMode: "split" })}
            className={`rounded-2xl border px-3 py-1 text-xs uppercase tracking-[0.3em] transition ${{
              true: "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.16)] text-[var(--foreground)]",
              false: "border-[var(--surface-border)]/50 text-[var(--foreground-muted)] hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]",
            }[String(value.viewMode === "split") as "true" | "false"]}`}
          >
            Split
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.78)] p-5">
        {diff.length === 1 && !diff[0].added && !diff[0].removed ? (
          <p className="text-sm text-[var(--foreground-muted)]">No differences detected.</p>
        ) : value.viewMode === "split" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Removed</p>
              <div className="space-y-2">
                {diff.filter((part) => part.removed).map((part, index) => (
                  <pre
                    key={`removed-${index}`}
                    className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
                  >
                    {part.value}
                  </pre>
                ))}
                {diff.filter((part) => part.removed).length === 0 ? (
                  <p className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.7)] p-4 text-sm text-[var(--foreground-muted)]">
                    No removals.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Added</p>
              <div className="space-y-2">
                {diff.filter((part) => part.added).map((part, index) => (
                  <pre
                    key={`added-${index}`}
                    className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200"
                  >
                    {part.value}
                  </pre>
                ))}
                {diff.filter((part) => part.added).length === 0 ? (
                  <p className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.7)] p-4 text-sm text-[var(--foreground-muted)]">
                    No additions.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {diff.map((part, index) => {
              const className = part.added
                ? "rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-200"
                : part.removed
                ? "rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200"
                : "rounded-2xl border border-[var(--surface-border)]/30 bg-[rgba(8,10,16,0.7)] px-4 py-3 text-[var(--foreground)]";
              return (
                <pre key={index} className={`${className} whitespace-pre-wrap`}> 
{part.value}</pre>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
