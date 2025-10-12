"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface LineSorterState {
  input: string;
  order: "asc" | "desc";
  trimLines: boolean;
  removeDuplicates: boolean;
  caseSensitive: boolean;
}

const SAMPLE_TEXT = `Devtools.io
makes
building
beautiful
tools
beautiful`;

export function LineSorter() {
  const { value, setValue, reset } = useLocalStorage<LineSorterState>("tool-line-sorter", {
    input: SAMPLE_TEXT,
    order: "asc",
    trimLines: true,
    removeDuplicates: true,
    caseSensitive: false,
  });
  const { notify } = useToast();

  const processed = useMemo(() => {
    const lines = value.input.split(/\r?\n/);
    const normalized = value.trimLines ? lines.map((line) => line.trim()) : lines.slice();
    const filtered = normalized.filter((line) => line.length > 0 || !value.trimLines);

    const compare = (a: string, b: string) => {
      const left = value.caseSensitive ? a : a.toLowerCase();
      const right = value.caseSensitive ? b : b.toLowerCase();
      if (left < right) return value.order === "asc" ? -1 : 1;
      if (left > right) return value.order === "asc" ? 1 : -1;
      return 0;
    };

    const sorted = [...filtered].sort(compare);
    const deduped = value.removeDuplicates
      ? sorted.filter((line, index, array) => {
          if (index === 0) return true;
          const prev = array[index - 1];
          return value.caseSensitive ? line !== prev : line.toLowerCase() !== prev.toLowerCase();
        })
      : sorted;

    return deduped.join("\n");
  }, [value.caseSensitive, value.input, value.order, value.removeDuplicates, value.trimLines]);

  const handleReset = () => {
    reset();
    notify("Line sorter reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Text</span>
            <CopyButton value={value.input} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Enter or paste lines to sort"
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Options</p>
            <CopyButton value={processed} label="Copy result" variant="outline" />
          </div>

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Sort order</span>
              <select
                value={value.order}
                onChange={(event) => setValue({ ...value, order: event.target.value as "asc" | "desc" })}
                className="rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Trim line edges</span>
              <input
                type="checkbox"
                checked={value.trimLines}
                onChange={(event) => setValue({ ...value, trimLines: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Remove duplicates</span>
              <input
                type="checkbox"
                checked={value.removeDuplicates}
                onChange={(event) => setValue({ ...value, removeDuplicates: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Case sensitive</span>
              <input
                type="checkbox"
                checked={value.caseSensitive}
                onChange={(event) => setValue({ ...value, caseSensitive: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>
          </div>
        </aside>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Result</p>
        <pre className="min-h-[160px] w-full whitespace-pre-wrap rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.78)] p-5 font-mono text-sm text-[var(--foreground)]">{processed || "Output will appear here"}</pre>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
