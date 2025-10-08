"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface JsonState {
  input: string;
  output: string;
  error: string | null;
}

const DEFAULT_SAMPLE = '{"name":"devtools.io","mission":"Frictionless Utility"}';

export function JsonFormatter() {
  const { value, setValue, reset } = useLocalStorage<JsonState>("tool-json-formatter", {
    input: "",
    output: "",
    error: null,
  });
  const [mode, setMode] = useState<"pretty" | "compact">("pretty");
  const { notify } = useToast();

  const run = useCallback(
    (targetMode: "pretty" | "compact") => {
      const trimmed = value.input.trim() || DEFAULT_SAMPLE;
      try {
        const parsed = JSON.parse(trimmed);
        const formatted = targetMode === "pretty" ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
        setValue({ input: trimmed, output: formatted, error: null });
        setMode(targetMode);
      } catch (error) {
        setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse JSON." });
      }
    },
    [setValue, value]
  );

  const handleClear = useCallback(() => {
    reset();
    setMode("pretty");
    notify("JSON formatter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input JSON</span>
            <button
              type="button"
              onClick={() => {
                setValue({ input: DEFAULT_SAMPLE, output: value.output, error: null });
                notify("Sample JSON loaded");
              }}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste JSON here"
          />
          {value.error ? <ToolError message={value.error} /> : null}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Result</span>
            <CopyButton value={value.output} label="Copy output" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            placeholder="Formatted JSON will appear here"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={() => run("pretty")}
          variant={mode === "pretty" ? "primary" : "secondary"}
        >
          Beautify JSON
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => run("compact")}
          variant={mode === "compact" ? "primary" : "secondary"}
        >
          Minify JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleClear} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
