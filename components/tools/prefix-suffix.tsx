"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface PrefixSuffixState {
  text: string;
  prefix: string;
  suffix: string;
  skipBlank: boolean;
  trimWhitespace: boolean;
}

const SAMPLE_TEXT = `name
email
role`;

export function PrefixSuffixTool() {
  const { value, setValue, reset } = useLocalStorage<PrefixSuffixState>("tool-prefix-suffix", {
    text: SAMPLE_TEXT,
    prefix: "const ",
    suffix: " = data;",
    skipBlank: true,
    trimWhitespace: false,
  });
  const { notify } = useToast();

  const processed = useMemo(() => {
    const lines = value.text.split(/\r?\n/);
    return lines
      .map((line) => {
        const target = value.trimWhitespace ? line.trim() : line;
        if (value.skipBlank && target.length === 0) {
          return line;
        }
        return `${value.prefix}${target}${value.suffix}`;
      })
      .join("\n");
  }, [value.prefix, value.skipBlank, value.suffix, value.text, value.trimWhitespace]);

  const handleReset = () => {
    reset();
    notify("Prefix/suffix tool reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Text</span>
            <CopyButton value={value.text} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.text}
            onChange={(event) => setValue({ ...value, text: event.target.value })}
            spellCheck={false}
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Enter or paste lines"
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Settings</p>
            <CopyButton value={processed} label="Copy result" variant="outline" />
          </div>

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <label className="flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Prefix</span>
              <input
                value={value.prefix}
                onChange={(event) => setValue({ ...value, prefix: event.target.value })}
                className="w-full rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="Prefix"
              />
            </label>

            <label className="flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Suffix</span>
              <input
                value={value.suffix}
                onChange={(event) => setValue({ ...value, suffix: event.target.value })}
                className="w-full rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="Suffix"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Skip blank lines</span>
              <input
                type="checkbox"
                checked={value.skipBlank}
                onChange={(event) => setValue({ ...value, skipBlank: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Trim whitespace</span>
              <input
                type="checkbox"
                checked={value.trimWhitespace}
                onChange={(event) => setValue({ ...value, trimWhitespace: event.target.checked })}
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
