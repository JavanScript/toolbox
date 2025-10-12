"use client";

import { useMemo } from "react";
import { optimize } from "svgo";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SvgOptimizerState {
  input: string;
  keepViewBox: boolean;
  removeDimensions: boolean;
  convertColors: boolean;
  multipass: boolean;
  prettify: boolean;
}

const SAMPLE_SVG = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <circle cx="60" cy="60" r="58" stroke="#58A6FF" stroke-width="4" />
    <path d="M36 64 L59 86 L84 34" stroke="#22D3EE" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

const DEFAULT_STATE: SvgOptimizerState = {
  input: SAMPLE_SVG,
  keepViewBox: true,
  removeDimensions: true,
  convertColors: true,
  multipass: true,
  prettify: false,
};

interface OptimizeResult {
  output: string;
  error: string | null;
  originalBytes: number;
  optimizedBytes: number;
}

export function SvgOptimizer() {
  const { value, setValue, reset } = useLocalStorage<SvgOptimizerState>("tool-svg-optimizer", DEFAULT_STATE);
  const { notify } = useToast();

  const result = useMemo<OptimizeResult>(() => {
    const original = value.input.trim();
    if (!original) {
      return { output: "", error: null, originalBytes: 0, optimizedBytes: 0 };
    }

    try {
      const overrides: Record<string, unknown> = {};
      if (value.keepViewBox) {
        overrides.removeViewBox = false;
      }
      if (!value.removeDimensions) {
        overrides.removeDimensions = false;
      }

      const plugins: unknown[] = [
        {
          name: "preset-default",
          params: {
            overrides,
          },
        },
      ];

      if (value.convertColors) {
        plugins.push("convertColors");
      }

      const optimized = optimize(original, {
        multipass: value.multipass,
        plugins,
        js2svg: {
          pretty: value.prettify,
          indent: value.prettify ? "  " : "",
        },
      });

      const optimizedData = "data" in optimized ? optimized.data : String(optimized);

      return {
        output: optimizedData,
        error: null,
        originalBytes: new TextEncoder().encode(original).length,
        optimizedBytes: new TextEncoder().encode(optimizedData).length,
      };
    } catch (cause) {
      console.warn("SVGO optimization failed", cause);
      return {
        output: "",
        error: cause instanceof Error ? cause.message : "Failed to optimize SVG",
        originalBytes: new TextEncoder().encode(original).length,
        optimizedBytes: 0,
      };
    }
  }, [value.convertColors, value.input, value.keepViewBox, value.multipass, value.prettify, value.removeDimensions]);

  const handleReset = () => {
    reset();
    notify("SVG optimizer reset");
  };

  const savings = result.originalBytes && result.optimizedBytes
    ? ((1 - result.optimizedBytes / result.originalBytes) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">SVG source</span>
              <CopyButton value={value.input} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.input}
              onChange={(event) => setValue({ ...value, input: event.target.value })}
              spellCheck={false}
              className="min-h-[320px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste SVG markup here"
            />
          </div>

          <div className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Options</p>
            <div className="space-y-3 text-sm text-[var(--foreground)]">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Keep viewBox attribute</span>
                <input
                  type="checkbox"
                  checked={value.keepViewBox}
                  onChange={(event) => setValue({ ...value, keepViewBox: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Remove width/height attributes</span>
                <input
                  type="checkbox"
                  checked={value.removeDimensions}
                  onChange={(event) => setValue({ ...value, removeDimensions: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Convert colors</span>
                <input
                  type="checkbox"
                  checked={value.convertColors}
                  onChange={(event) => setValue({ ...value, convertColors: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Enable multipass</span>
                <input
                  type="checkbox"
                  checked={value.multipass}
                  onChange={(event) => setValue({ ...value, multipass: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Prettify output</span>
                <input
                  type="checkbox"
                  checked={value.prettify}
                  onChange={(event) => setValue({ ...value, prettify: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Optimized SVG</p>
            {result.output ? <CopyButton value={result.output} label="Copy SVG" variant="outline" /> : null}
          </div>

          {result.error ? <ToolError message={result.error} /> : null}

          <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs text-[var(--foreground)]">
            <pre className="max-h-[260px] whitespace-pre-wrap break-all font-mono">{result.output || "Optimization output will appear here"}</pre>
          </div>

          <div className="space-y-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            <span>Original: {result.originalBytes} bytes</span>
            <span>Optimized: {result.optimizedBytes} bytes</span>
            <span>Savings: {savings}%</span>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
