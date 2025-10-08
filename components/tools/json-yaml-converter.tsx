"use client";

import { useCallback } from "react";
import { dump, load } from "js-yaml";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

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

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleJsonToYaml}>
          Convert to YAML
        </ToolButton>
        <ToolButton type="button" onClick={handleYamlToJson} variant="secondary">
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
