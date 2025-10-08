"use client";

import { useCallback } from "react";
import {
  toGo,
  toJavaScript,
  toNodeAxios,
  toPython,
} from "curlconverter/dist/src/index.js";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface CurlState {
  input: string;
  outputs: {
    javascript: string;
    axios: string;
    python: string;
    go: string;
  };
  error: string | null;
}

const SAMPLE_CURL = `curl https://api.devtools.io/users \\
  -H "Authorization: Bearer token" \\
  -d '{"email":"hello@devtools.io"}'`;

export function CurlToCodeConverter() {
  const { value, setValue, reset } = useLocalStorage<CurlState>("tool-curl", {
    input: SAMPLE_CURL,
    outputs: {
      javascript: "",
      axios: "",
      python: "",
      go: "",
    },
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const command = value.input.trim() || SAMPLE_CURL;
      const javascript = toJavaScript(command);
      const axios = toNodeAxios(command);
      const python = toPython(command);
      const go = toGo(command);
      setValue({
        input: command,
        outputs: { javascript, axios, python, go },
        error: null,
      });
      notify("Converted cURL command");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert cURL." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("cURL converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify_between">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">cURL command</span>
          <button
            type="button"
            onClick={() => {
              setValue({ ...value, input: SAMPLE_CURL, error: null });
              notify("Sample cURL loaded");
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
          className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          placeholder="Paste a cURL command"
        />
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { label: "JavaScript fetch", key: "javascript" as const },
          { label: "Node.js Axios", key: "axios" as const },
          { label: "Python requests", key: "python" as const },
          { label: "Go (net/http)", key: "go" as const },
        ].map((entry) => (
          <div key={entry.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</span>
              <CopyButton value={value.outputs[entry.key]} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.outputs[entry.key]}
              readOnly
              spellCheck={false}
              className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-xs text-[var(--foreground)]"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert command
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
