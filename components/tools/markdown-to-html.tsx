"use client";

import { useCallback } from "react";
import { marked } from "marked";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface MarkdownHtmlState {
  input: string;
  output: string;
  error: string | null;
  preview: boolean;
}

const SAMPLE_MARKDOWN = `# Build with care

- Frictionless utility
- Client-side privacy
- Crafted interactions

> Tools should feel as good as they perform.`;

export function MarkdownToHtmlConverter() {
  const { value, setValue, reset } = useLocalStorage<MarkdownHtmlState>("tool-markdown-html", {
    input: SAMPLE_MARKDOWN,
    output: marked.parse(SAMPLE_MARKDOWN) as string,
    error: null,
    preview: true,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const input = value.input.trim() || SAMPLE_MARKDOWN;
      const html = marked.parse(input, { async: false }) as string;
      setValue({ ...value, input, output: html, error: null });
      notify("Converted Markdown to HTML");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert Markdown." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Markdown → HTML reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Markdown</span>
            <button
              type="button"
              onClick={() => {
                const html = marked.parse(SAMPLE_MARKDOWN) as string;
                setValue({ input: SAMPLE_MARKDOWN, output: html, error: null, preview: value.preview });
                notify("Sample Markdown loaded");
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
            placeholder="Paste Markdown"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HTML</span>
            <CopyButton value={value.output} label="Copy" variant="outline" />
          </div>
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            {value.preview ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: value.output || "<p>Nothing to preview yet.</p>" }}
              />
            ) : (
              <textarea
                value={value.output}
                readOnly
                spellCheck={false}
                className="h-[260px] w-full resize-none rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-4 font-mono text-sm text-[var(--foreground)]"
              />
            )}
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert to HTML
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => setValue({ ...value, preview: !value.preview })}
          variant="secondary"
        >
          {value.preview ? "Show raw HTML" : "Show preview"}
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
