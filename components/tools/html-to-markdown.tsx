"use client";

import { useCallback, useMemo } from "react";
import TurndownService from "turndown";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface HtmlMarkdownState {
  input: string;
  output: string;
  error: string | null;
}

const SAMPLE_HTML = `<article class="prose">
  <h1>Design Principles</h1>
  <p>Build tools that feel <strong>fast</strong>, look <em>intentional</em>, and keep data private.</p>
  <ul>
    <li>Frictionless UX</li>
    <li>Client-side only</li>
    <li>Crafted interfaces</li>
  </ul>
</article>`;

export function HtmlToMarkdownConverter() {
  const { value, setValue, reset } = useLocalStorage<HtmlMarkdownState>("tool-html-markdown", {
    input: SAMPLE_HTML,
    output: "",
    error: null,
  });
  const { notify } = useToast();

  const turndown = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });
    service.addRule("strikethrough", {
      filter: ["del", "s"],
      replacement: (content) => `~~${content}~~`,
    });
    return service;
  }, []);

  const run = useCallback(() => {
    try {
      const input = value.input.trim() || SAMPLE_HTML;
      const markdown = turndown.turndown(input);
      setValue({ input, output: markdown, error: null });
      notify("Converted HTML to Markdown");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert HTML." });
    }
  }, [notify, setValue, turndown, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("HTML → Markdown reset");
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
                const markdown = turndown.turndown(SAMPLE_HTML);
                setValue({ input: SAMPLE_HTML, output: markdown, error: null });
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
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste HTML"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Markdown</span>
            <CopyButton value={value.output} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert to Markdown
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
