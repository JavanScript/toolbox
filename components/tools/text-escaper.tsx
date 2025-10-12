"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface TextEscaperState {
  input: string;
  mode: "html" | "json" | "url";
  action: "escape" | "unescape";
}

const SAMPLE_TEXT = `<div class="hero">Devtools.io & Friends</div>`;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function unescapeHtml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeJson(value: string) {
  return JSON.stringify(value).slice(1, -1);
}

function unescapeJson(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
  } catch (error) {
    throw new Error("Invalid JSON escape sequence");
  }
}

function escapeUrl(value: string) {
  return encodeURIComponent(value);
}

function unescapeUrl(value: string) {
  return decodeURIComponent(value);
}

export function TextEscaper() {
  const { value, setValue, reset } = useLocalStorage<TextEscaperState>("tool-text-escaper", {
    input: SAMPLE_TEXT,
    mode: "html",
    action: "escape",
  });
  const { notify } = useToast();

  const { result, error } = useMemo(() => {
    try {
      let result = value.input;
      if (value.action === "escape") {
        result =
          value.mode === "html"
            ? escapeHtml(value.input)
            : value.mode === "json"
            ? escapeJson(value.input)
            : escapeUrl(value.input);
      } else {
        result =
          value.mode === "html"
            ? unescapeHtml(value.input)
            : value.mode === "json"
            ? unescapeJson(value.input)
            : unescapeUrl(value.input);
      }
      return { result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed";
      return { result: "", error: message };
    }
  }, [value]);

  const handleReset = () => {
    reset();
    notify("Text escaper reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input</span>
            <CopyButton value={value.input} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Enter text to escape or unescape"
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Options</p>
            <CopyButton value={result} label="Copy result" variant="outline" />
          </div>

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <label className="flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Mode</span>
              <select
                value={value.mode}
                onChange={(event) => setValue({ ...value, mode: event.target.value as TextEscaperState["mode"] })}
                className="rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              >
                <option value="html">HTML entities</option>
                <option value="json">JSON string</option>
                <option value="url">URL encoding</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Action</span>
              <select
                value={value.action}
                onChange={(event) => setValue({ ...value, action: event.target.value as TextEscaperState["action"] })}
                className="rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              >
                <option value="escape">Escape</option>
                <option value="unescape">Unescape</option>
              </select>
            </label>
          </div>
        </aside>
      </div>

  {error ? <ToolError message={error} /> : null}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Result</p>
  <pre className="min-h-[160px] w-full whitespace-pre-wrap rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.78)] p-5 font-mono text-sm text-[var(--foreground)]">{result || "Output will appear here"}</pre>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
