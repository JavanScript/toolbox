"use client";

import { useCallback, useMemo } from "react";
import HTMLtoJSX from "html-to-jsx";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface HtmlToJsxState {
  input: string;
  output: string;
  error: string | null;
}

const SAMPLE_HTML = `<div class="card">
  <h2>Title</h2>
  <button type="button">Click me</button>
</div>`;

export function HtmlToJsxConverter() {
  const { value, setValue, reset } = useLocalStorage<HtmlToJsxState>("tool-html-jsx", {
    input: SAMPLE_HTML,
    output: "",
    error: null,
  });
  const { notify } = useToast();
  const converter = useMemo(() => new HTMLtoJSX({ createClass: false, indent: "  " }), []);

  const run = useCallback(() => {
    try {
      const trimmed = value.input.trim() || SAMPLE_HTML;
      const jsx = converter.convert(trimmed);
      setValue({ input: trimmed, output: jsx, error: null });
      notify("Converted HTML to JSX");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert to JSX." });
    }
  }, [converter, notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("HTML → JSX reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HTML</span>
            <button
              type="button"
              onClick={() => {
                setValue({ input: SAMPLE_HTML, output: value.output, error: null });
                notify("Sample HTML loaded");
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
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste HTML markup"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSX result</span>
            <CopyButton value={value.output} label="Copy JSX" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[240px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            placeholder="JSX will appear here"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert to JSX
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
