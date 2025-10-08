"use client";

import { useCallback } from "react";
import { dump, load } from "js-yaml";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface JsonYamlState {
  jsonInput: string;
  yamlInput: string;
  error: string | null;
}

const SAMPLE_JSON = JSON.stringify(
  {
    service: "devtools.io",
    mission: "Frictionless Utility",
    tags: ["design", "performance", "privacy"],
    metadata: {
      release: 1,
      status: "alpha",
    },
  },
  null,
  2
);

export function JsonYamlConverter() {
  const { value, setValue, reset } = useLocalStorage<JsonYamlState>("tool-json-yaml", {
    jsonInput: SAMPLE_JSON,
    yamlInput: dump(JSON.parse(SAMPLE_JSON)),
    error: null,
  });
  const { notify } = useToast();

  const buttonBase =
    "rounded-xl px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60";
  const primaryButton =
    `${buttonBase} bg-[var(--accent)] text-[#0b0d12] shadow-[0_20px_45px_-25px_var(--glow)] hover:bg-[#6baeff]`;
  const secondaryButton =
    `${buttonBase} border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] text-[var(--foreground)] hover:border-[var(--accent)]/50`;
  const ghostButton =
    `${buttonBase} border border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]`;

  const handleJsonToYaml = useCallback(() => {
    try {
      const parsed = JSON.parse(value.jsonInput.trim());
      const yaml = dump(parsed, { indent: 2, lineWidth: 120 });
      setValue({ jsonInput: value.jsonInput, yamlInput: yaml, error: null });
      notify("Converted JSON to YAML");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse JSON." });
    }
  }, [notify, setValue, value]);

  const handleYamlToJson = useCallback(() => {
    try {
      const parsed = load(value.yamlInput.trim() || "") ?? {};
      const json = JSON.stringify(parsed, null, 2);
      setValue({ jsonInput: json, yamlInput: value.yamlInput, error: null });
      notify("Converted YAML to JSON");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse YAML." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("JSON ↔ YAML reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON</span>
            <button
              type="button"
              onClick={() => {
                setValue({ jsonInput: SAMPLE_JSON, yamlInput: dump(JSON.parse(SAMPLE_JSON)), error: null });
                notify("Sample JSON loaded");
              }}
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
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">YAML</span>
            <CopyButton value={value.yamlInput} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.yamlInput}
            onChange={(event) => setValue({ ...value, yamlInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste YAML"
          />
        </div>
      </div>

      {value.error ? (
        <p className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/40 bg-[rgba(88,166,255,0.06)] px-3 py-2 text-xs text-[var(--accent)]">
          <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
            <path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" fill="currentColor" />
          </svg>
          {value.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={handleJsonToYaml} className={primaryButton}>
          Convert to YAML
        </button>
        <button type="button" onClick={handleYamlToJson} className={secondaryButton}>
          Convert to JSON
        </button>
        <button type="button" onClick={handleReset} className={ghostButton}>
          Reset tool
        </button>
      </div>
    </div>
  );
}
