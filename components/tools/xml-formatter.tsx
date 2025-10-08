"use client";

import { useCallback } from "react";
import formatXml from "xml-formatter";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

const SAMPLE_XML = `<note>
  <to>Developer</to>
  <from>devtools.io</from>
  <heading>Frictionless Utility</heading>
  <body>All tools stay in your browser.</body>
</note>`;

type IndentationOption = "  " | "    " | "\t";

type XmlMode = "beautify" | "minify";

interface XmlState {
  input: string;
  output: string;
  indentation: IndentationOption;
  collapseContent: boolean;
  spaceBeforeSelfClosing: boolean;
  mode: XmlMode;
  error: string | null;
}

const INDENT_PRESETS: Array<{ label: string; value: IndentationOption }> = [
  { label: "2 spaces", value: "  " },
  { label: "4 spaces", value: "    " },
  { label: "Tabs", value: "\t" },
];

export function XmlFormatterTool() {
  const { value, setValue, reset } = useLocalStorage<XmlState>("tool-xml-formatter", {
    input: SAMPLE_XML,
    output: formatXml(SAMPLE_XML, { indentation: "  ", lineSeparator: "\n" }),
    indentation: "  ",
    collapseContent: false,
    spaceBeforeSelfClosing: false,
    mode: "beautify",
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(
    (mode: XmlMode) => {
      const trimmed = value.input.trim() || SAMPLE_XML;
      try {
        const commonOptions = {
          indentation: value.indentation,
          collapseContent: value.collapseContent,
          whiteSpaceAtEndOfSelfclosingTag: value.spaceBeforeSelfClosing,
          lineSeparator: "\n",
          throwOnFailure: true,
        } as const;

        const output =
          mode === "beautify"
            ? formatXml(trimmed, commonOptions)
            : formatXml.minify(trimmed, {
                collapseContent: false,
                whiteSpaceAtEndOfSelfclosingTag: value.spaceBeforeSelfClosing,
                throwOnFailure: true,
                strictMode: true,
              });

        setValue({
          ...value,
          input: trimmed,
          output,
          mode,
          error: null,
        });
        notify(mode === "beautify" ? "XML formatted" : "XML minified");
      } catch (error) {
        setValue({
          ...value,
          input: trimmed,
          error: error instanceof Error ? error.message : "Unable to format XML.",
        });
      }
    },
    [notify, setValue, value]
  );

  const handleReset = useCallback(() => {
    reset();
    notify("XML formatter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input XML</span>
            <button
              type="button"
              onClick={() => setValue({ ...value, input: SAMPLE_XML, error: null })}
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
            placeholder="Paste XML here"
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
            placeholder="Formatted XML will appear here"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
        <label className="flex items-center gap-2">
          Indentation
          <select
            value={value.indentation}
            onChange={(event) =>
              setValue({
                ...value,
                indentation: event.target.value as IndentationOption,
                error: null,
              })
            }
            className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          >
            {INDENT_PRESETS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.collapseContent}
            onChange={(event) => setValue({ ...value, collapseContent: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Collapse content
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.spaceBeforeSelfClosing}
            onChange={(event) => setValue({ ...value, spaceBeforeSelfClosing: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Space before self-closing
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={() => run("beautify")}
          variant={value.mode === "beautify" ? "primary" : "secondary"}
        >
          Beautify XML
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => run("minify")}
          variant={value.mode === "minify" ? "primary" : "secondary"}
        >
          Minify XML
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
