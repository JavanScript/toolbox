"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface QueryState {
  input: string;
  result: string;
  error: string | null;
}

const SAMPLE_URL = "https://devtools.io/tools?env=prod&feature=workspaces&ids=1&ids=2";

function parseQuery(input: string): Record<string, string | string[]> {
  const trimmed = input.trim();
  const text = trimmed.includes("?") ? trimmed.split("?")[1] ?? "" : trimmed;
  const params = new URLSearchParams(text);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  });
  return result;
}

export function QueryParamsToJson() {
  const { value, setValue, reset } = useLocalStorage<QueryState>("tool-query-json", {
    input: SAMPLE_URL,
    result: JSON.stringify(parseQuery(SAMPLE_URL), null, 2),
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const payload = value.input.trim() || SAMPLE_URL;
      const parsed = parseQuery(payload);
      setValue({ input: payload, result: JSON.stringify(parsed, null, 2), error: null });
      notify("Parsed query parameters");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse query string." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Query parser reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">URL or query string</span>
          <button
            type="button"
            onClick={() => {
              setValue({ ...value, input: SAMPLE_URL, error: null });
              notify("Sample URL loaded");
            }}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={value.input}
          onChange={(event) => setValue({ ...value, input: event.target.value, error: null })}
          spellCheck={false}
          className="min-h-[160px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          placeholder="Paste a URL or query string"
        />
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON output</span>
          <CopyButton value={value.result} label="Copy JSON" variant="outline" />
        </div>
        <textarea
          value={value.result}
          readOnly
          spellCheck={false}
          className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
