"use client";

import { useCallback } from "react";
import * as TOML from "@iarna/toml";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface JsonTomlState {
  jsonInput: string;
  tomlInput: string;
  error: string | null;
}

const SAMPLE_OBJECT = {
  service: "devtools.io",
  mission: "Frictionless Utility",
  tags: ["design", "performance", "privacy"],
  metadata: {
    release: 1,
    status: "alpha",
  },
};

const SAMPLE_JSON = JSON.stringify(SAMPLE_OBJECT, null, 2);
const SAMPLE_TOML = TOML.stringify(SAMPLE_OBJECT);

export function JsonTomlConverter() {
  const { value, setValue, reset } = useLocalStorage<JsonTomlState>("tool-json-toml", {
    jsonInput: SAMPLE_JSON,
    tomlInput: SAMPLE_TOML,
    error: null,
  });
  const { notify } = useToast();

  const handleJsonToToml = useCallback(() => {
    try {
      const cleanInput = value.jsonInput.trim();
      const parsed = cleanInput ? JSON.parse(cleanInput) : {};
      const toml = TOML.stringify(parsed);
      setValue({ jsonInput: value.jsonInput, tomlInput: toml, error: null });
      notify("Converted JSON to TOML");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse JSON." });
    }
  }, [notify, setValue, value]);

  const handleTomlToJson = useCallback(() => {
    try {
      const cleanInput = value.tomlInput.trim();
      const parsed = cleanInput ? TOML.parse(cleanInput) : {};
      const json = JSON.stringify(parsed, null, 2);
      setValue({ jsonInput: json, tomlInput: value.tomlInput, error: null });
      notify("Converted TOML to JSON");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse TOML." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("JSON ↔ TOML reset");
  }, [notify, reset]);

  const handleLoadSample = useCallback(() => {
    setValue({ jsonInput: SAMPLE_JSON, tomlInput: SAMPLE_TOML, error: null });
    notify("Sample JSON loaded");
  }, [notify, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.jsonInput}
            onChange={(event) => setValue({ ...value, jsonInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste JSON"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">TOML</span>
            <CopyButton value={value.tomlInput} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.tomlInput}
            onChange={(event) => setValue({ ...value, tomlInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste TOML"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleJsonToToml}>
          Convert to TOML
        </ToolButton>
        <ToolButton type="button" onClick={handleTomlToJson} variant="secondary">
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
