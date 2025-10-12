"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface WhitespaceState {
  text: string;
  trimEdges: boolean;
  collapseSpaces: boolean;
  removeEmptyLines: boolean;
  removeAllWhitespace: boolean;
}

const SAMPLE_TEXT = ` Devtools.io   makes\n\n  delightful   tools  for  developers. \n `;

function processWhitespace(state: WhitespaceState) {
  let output = state.text;

  if (state.removeAllWhitespace) {
    output = output.replace(/\s+/g, "");
    return output;
  }

  if (state.trimEdges) {
    output = output.trim();
  }

  if (state.collapseSpaces) {
    output = output.replace(/[ \t]+/g, " ");
  }

  if (state.removeEmptyLines) {
    output = output
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join("\n");
  }

  return output;
}

export function WhitespaceRemover() {
  const { value, setValue, reset } = useLocalStorage<WhitespaceState>("tool-whitespace-remover", {
    text: SAMPLE_TEXT,
    trimEdges: true,
    collapseSpaces: true,
    removeEmptyLines: true,
    removeAllWhitespace: false,
  });
  const { notify } = useToast();

  const result = useMemo(() => processWhitespace(value), [value]);

  const handleReset = () => {
    reset();
    notify("Whitespace remover reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Text</span>
            <CopyButton value={value.text} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.text}
            onChange={(event) => setValue({ ...value, text: event.target.value })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste text with inconsistent spacing"
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Options</p>
            <CopyButton value={result} label="Copy result" variant="outline" />
          </div>

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Trim leading & trailing</span>
              <input
                type="checkbox"
                checked={value.trimEdges}
                onChange={(event) => setValue({ ...value, trimEdges: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Collapse spaces & tabs</span>
              <input
                type="checkbox"
                checked={value.collapseSpaces}
                onChange={(event) => setValue({ ...value, collapseSpaces: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Remove empty lines</span>
              <input
                type="checkbox"
                checked={value.removeEmptyLines}
                onChange={(event) => setValue({ ...value, removeEmptyLines: event.target.checked })}
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
              <span>Strip all whitespace</span>
              <input
                type="checkbox"
                checked={value.removeAllWhitespace}
                onChange={(event) =>
                  setValue({
                    ...value,
                    removeAllWhitespace: event.target.checked,
                    collapseSpaces: event.target.checked ? false : value.collapseSpaces,
                    removeEmptyLines: event.target.checked ? false : value.removeEmptyLines,
                  })
                }
                className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </label>
          </div>
        </aside>
      </div>

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
