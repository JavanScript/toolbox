"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SlugifyState {
  text: string;
  delimiter: string;
  preserveCase: boolean;
  removeDiacritics: boolean;
}

const SAMPLE_TEXT = "Devtools.io helps designers & developers ship faster.";

function slugify({
  text,
  delimiter,
  preserveCase,
  removeDiacritics,
}: {
  text: string;
  delimiter: string;
  preserveCase: boolean;
  removeDiacritics: boolean;
}) {
  let result = text.trim();

  if (removeDiacritics) {
    result = result.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  }

  if (!preserveCase) {
    result = result.toLowerCase();
  }

  result = result
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, delimiter)
    .replace(/-+/g, delimiter)
    .replace(new RegExp(`${delimiter}+`, "g"), delimiter);

  return result.replace(new RegExp(`^${delimiter}|${delimiter}$`, "g"), "");
}

export function SlugifyHelper() {
  const { value, setValue, reset } = useLocalStorage<SlugifyState>("tool-slugify", {
    text: SAMPLE_TEXT,
    delimiter: "-",
    preserveCase: false,
    removeDiacritics: true,
  });
  const { notify } = useToast();

  const slug = useMemo(
    () =>
      slugify({
        text: value.text,
        delimiter: value.delimiter || "-",
        preserveCase: value.preserveCase,
        removeDiacritics: value.removeDiacritics,
      }),
    [value]
  );

  const handleReset = () => {
    reset();
    notify("Slugify helper reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Source text</span>
            <textarea
              value={value.text}
              onChange={(event) => setValue({ ...value, text: event.target.value })}
              spellCheck={false}
              className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste text to slugify"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Delimiter</span>
              <input
                value={value.delimiter}
                onChange={(event) => setValue({ ...value, delimiter: event.target.value.slice(0, 1) || "-" })}
                className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="-"
                maxLength={1}
              />
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={value.preserveCase}
                onChange={(event) => setValue({ ...value, preserveCase: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>Preserve case</span>
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={value.removeDiacritics}
                onChange={(event) => setValue({ ...value, removeDiacritics: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>Remove diacritics</span>
            </label>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Slug</p>
            <CopyButton value={slug} label="Copy slug" variant="outline" />
          </div>
          <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.82)] p-4 text-sm text-[var(--foreground)]">
            {slug || <span className="text-[var(--foreground-muted)]">Slug will appear here</span>}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
