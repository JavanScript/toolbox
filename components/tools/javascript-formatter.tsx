"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { formatJavaScript } from "@/lib/prettier-client";

type TrailingComma = "none" | "es5" | "all";

const SAMPLE_JS = `const formatTool = (input) => {
  const normalized = input.trim();
  return {
    message: \`Formatted \${normalized.length} characters\`,
    createdAt: new Date().toISOString(),
  };
};

console.log(formatTool(" devtools.io "));
`;

interface JavaScriptFormatterState {
  input: string;
  output: string;
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: TrailingComma;
  error: string | null;
}

export function JavaScriptFormatterTool() {
  const { value, setValue, reset } = useLocalStorage<JavaScriptFormatterState>(
    "tool-javascript-formatter",
    {
      input: SAMPLE_JS,
      output: SAMPLE_JS,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      error: null,
    }
  );
  const { notify } = useToast();
  const [isFormatting, setIsFormatting] = useState(false);

  const run = useCallback(async () => {
    if (isFormatting) return;
    const source = value.input.trim() || SAMPLE_JS;
    setIsFormatting(true);
    try {
      const formatted = await formatJavaScript(source, {
        printWidth: value.printWidth,
        tabWidth: value.tabWidth,
        useTabs: value.useTabs,
        semi: value.semi,
        singleQuote: value.singleQuote,
        trailingComma: value.trailingComma,
      });
      setValue({ ...value, output: formatted, error: null });
      notify("JavaScript formatted");
    } catch (error) {
      setValue({
        ...value,
        error: error instanceof Error ? error.message : "Unable to format JavaScript.",
      });
    } finally {
      setIsFormatting(false);
    }
  }, [isFormatting, notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("JavaScript formatter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Input JavaScript
            </span>
            <button
              type="button"
              onClick={() => setValue({ ...value, input: SAMPLE_JS, error: null })}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste JavaScript"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Result
            </span>
            <CopyButton value={value.output} label="Copy output" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            placeholder="Formatted JavaScript will appear here"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
        <label className="flex items-center gap-2">
          Print width
          <input
            type="number"
            min={40}
            max={160}
            value={value.printWidth}
            onChange={(event) =>
              setValue({
                ...value,
                printWidth: Math.min(Math.max(Number(event.target.value) || 80, 40), 160),
                error: null,
              })
            }
            className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          Tab width
          <input
            type="number"
            min={2}
            max={8}
            value={value.tabWidth}
            onChange={(event) =>
              setValue({
                ...value,
                tabWidth: Math.min(Math.max(Number(event.target.value) || 2, 2), 8),
                error: null,
              })
            }
            className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.useTabs}
            onChange={(event) => setValue({ ...value, useTabs: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Use tabs
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.semi}
            onChange={(event) => setValue({ ...value, semi: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Include semicolons
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.singleQuote}
            onChange={(event) => setValue({ ...value, singleQuote: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Prefer single quotes
        </label>
        <label className="flex items-center gap-2">
          Trailing commas
          <select
            value={value.trailingComma}
            onChange={(event) => setValue({ ...value, trailingComma: event.target.value as TrailingComma, error: null })}
            className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          >
            <option value="none">None</option>
            <option value="es5">ES5</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={run}
          disabled={isFormatting}
          className={isFormatting ? "cursor-not-allowed opacity-60" : undefined}
        >
          {isFormatting ? "Formatting…" : "Format JavaScript"}
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
