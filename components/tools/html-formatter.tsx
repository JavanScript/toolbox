"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { formatHtml } from "@/lib/prettier-client";

const SAMPLE_HTML = `<section class="hero">
  <h1>devtools.io</h1>
  <p class="tagline">50+ frictionless developer utilities.</p>
</section>`;

interface HtmlFormatterState {
  input: string;
  output: string;
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  singleAttributePerLine: boolean;
  error: string | null;
}

export function HtmlFormatterTool() {
  const { value, setValue, reset } = useLocalStorage<HtmlFormatterState>("tool-html-formatter", {
    input: SAMPLE_HTML,
    output: SAMPLE_HTML,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleAttributePerLine: false,
    error: null,
  });
  const { notify } = useToast();
  const [isFormatting, setIsFormatting] = useState(false);

  const run = useCallback(async () => {
    if (isFormatting) return;
    const source = value.input.trim() || SAMPLE_HTML;
    setIsFormatting(true);
    try {
      const formatted = await formatHtml(source, {
        printWidth: value.printWidth,
        tabWidth: value.tabWidth,
        useTabs: value.useTabs,
        singleAttributePerLine: value.singleAttributePerLine,
      });
      setValue({ ...value, output: formatted, error: null });
      notify("HTML formatted");
    } catch (error) {
      setValue({
        ...value,
        error:
          error instanceof Error
            ? error.message
            : "Unable to format HTML.",
      });
    } finally {
      setIsFormatting(false);
    }
  }, [isFormatting, notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("HTML formatter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input HTML</span>
            <button
              type="button"
              onClick={() => setValue({ ...value, input: SAMPLE_HTML, error: null })}
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
            placeholder="Paste HTML markup"
          />
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
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            placeholder="Formatted HTML will appear here"
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
            checked={value.singleAttributePerLine}
            onChange={(event) => setValue({ ...value, singleAttributePerLine: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Single attribute per line
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={run}
          disabled={isFormatting}
          className={isFormatting ? "cursor-not-allowed opacity-60" : undefined}
        >
          {isFormatting ? "Formatting…" : "Format HTML"}
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
