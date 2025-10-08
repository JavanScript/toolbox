"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface DotenvState {
  input: string;
  result: string;
  error: string | null;
}

const SAMPLE_ENV = `# App configuration
API_URL=https://api.devtools.io
ENABLE_ANALYTICS=false
PRIMARY_COLOR=58A6FF`;

function parseDotenv(text: string) {
  const lines = text.split(/\r?\n/);
  const result: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (key) {
      result[key] = value;
    }
  }
  return result;
}

export function DotenvToJsonConverter() {
  const { value, setValue, reset } = useLocalStorage<DotenvState>("tool-dotenv-json", {
    input: SAMPLE_ENV,
    result: JSON.stringify(parseDotenv(SAMPLE_ENV), null, 2),
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const input = value.input.trim() || SAMPLE_ENV;
      const parsed = parseDotenv(input);
      setValue({ input, result: JSON.stringify(parsed, null, 2), error: null });
      notify("Converted .env to JSON");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse .env file." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify(".env converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">.env content</span>
            <button
              type="button"
              onClick={() => {
                setValue({
                  ...value,
                  input: SAMPLE_ENV,
                  result: JSON.stringify(parseDotenv(SAMPLE_ENV), null, 2),
                  error: null,
                });
                notify("Sample .env loaded");
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
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste .env contents"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON output</span>
            <CopyButton value={value.result} label="Copy JSON" variant="outline" />
          </div>
          <textarea
            value={value.result}
            readOnly
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert .env
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
