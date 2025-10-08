"use client";

import { useCallback, useState } from "react";
import Papa from "papaparse";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface JsonCsvState {
  jsonInput: string;
  csvInput: string;
  error: string | null;
}

const SAMPLE_JSON = JSON.stringify(
  [
    { id: 1, name: "Ray", role: "Designer" },
    { id: 2, name: "Noel", role: "Engineer" },
  ],
  null,
  2
);

const SAMPLE_CSV = "id,name,role\n1,Ray,Designer\n2,Noel,Engineer";

export function JsonCsvConverter() {
  const { value, setValue, reset } = useLocalStorage<JsonCsvState>("tool-json-csv", {
    jsonInput: SAMPLE_JSON,
    csvInput: SAMPLE_CSV,
    error: null,
  });
  const { notify } = useToast();
  const [delimiter, setDelimiter] = useState(",");

  const handleJsonToCsv = useCallback(() => {
    try {
      const parsed = JSON.parse(value.jsonInput.trim() || "[]");
      if (!Array.isArray(parsed)) {
        throw new Error("Top-level JSON must be an array of objects.");
      }
      const csv = Papa.unparse(parsed, { delimiter });
      setValue({ jsonInput: value.jsonInput, csvInput: csv, error: null });
      notify("Converted JSON to CSV");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert JSON." });
    }
  }, [delimiter, notify, setValue, value]);

  const handleCsvToJson = useCallback(() => {
    const result = Papa.parse(value.csvInput, {
      header: true,
      skipEmptyLines: true,
      delimiter,
    });
    if (result.errors.length > 0) {
      const [firstError] = result.errors;
      setValue({ ...value, error: firstError.message || "Unable to parse CSV." });
      return;
    }
    const json = JSON.stringify(result.data, null, 2);
    setValue({ jsonInput: json, csvInput: value.csvInput, error: null });
    notify("Converted CSV to JSON");
  }, [delimiter, notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    setDelimiter(",");
    notify("JSON ↔ CSV reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON array</span>
            <button
              type="button"
              onClick={() => {
                setValue({ jsonInput: SAMPLE_JSON, csvInput: SAMPLE_CSV, error: null });
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
            placeholder="Paste JSON array"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">CSV</span>
            <CopyButton value={value.csvInput} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.csvInput}
            onChange={(event) => setValue({ ...value, csvInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste CSV"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
          Delimiter
          <select
            value={delimiter}
            onChange={(event) => setDelimiter(event.target.value)}
            className="rounded-xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] px-3 py-1 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </label>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleJsonToCsv}>
          Convert to CSV
        </ToolButton>
        <ToolButton type="button" onClick={handleCsvToJson} variant="secondary">
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
