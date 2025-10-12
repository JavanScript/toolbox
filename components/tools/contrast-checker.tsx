"use client";

import { useMemo } from "react";
import { converter, parse } from "culori";
import type { CuloriColor } from "culori";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ContrastCheckerState {
  foreground: string;
  background: string;
  sample: string;
}

interface ContrastResult {
  ratio: number;
  evaluations: Array<{ label: string; requirement: number; pass: boolean; description: string }>;
}

const DEFAULT_FOREGROUND = "#F8FAFC";
const DEFAULT_BACKGROUND = "#0B1120";

const toRgb = converter("rgb");

interface RgbColorLike {
  mode: "rgb";
  r?: number;
  g?: number;
  b?: number;
  alpha?: number;
}

function isRgbColor(value: unknown): value is RgbColorLike {
  return typeof value === "object" && value !== null && (value as { mode?: string }).mode === "rgb";
}

function linearize(value: number) {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function getLuminance(color: CuloriColor) {
  const raw = toRgb(color);
  if (!isRgbColor(raw)) {
    return null;
  }
  const { r = 0, g = 0, b = 0 } = raw;
  const linearR = linearize(r);
  const linearG = linearize(g);
  const linearB = linearize(b);
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

function getContrast(foreground: CuloriColor, background: CuloriColor): ContrastResult | null {
  const luminanceForeground = getLuminance(foreground);
  const luminanceBackground = getLuminance(background);
  if (luminanceForeground === null || luminanceBackground === null) {
    return null;
  }

  const lighter = Math.max(luminanceForeground, luminanceBackground);
  const darker = Math.min(luminanceForeground, luminanceBackground);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const evaluations: ContrastResult["evaluations"] = [
    {
      label: "WCAG AA (normal text)",
      requirement: 4.5,
      pass: ratio >= 4.5,
      description: "Minimum for body text at standard sizes.",
    },
    {
      label: "WCAG AA (large text)",
      requirement: 3,
      pass: ratio >= 3,
      description: "Applies to text ≥ 18pt regular or 14pt bold.",
    },
    {
      label: "WCAG AAA (normal text)",
      requirement: 7,
      pass: ratio >= 7,
      description: "Enhanced readability for small text.",
    },
    {
      label: "WCAG AAA (large text)",
      requirement: 4.5,
      pass: ratio >= 4.5,
      description: "Elevated contrast for larger headings.",
    },
    {
      label: "Non-text elements",
      requirement: 3,
      pass: ratio >= 3,
      description: "UI components and graphics.",
    },
  ];

  return { ratio, evaluations };
}

export function ContrastChecker() {
  const { value, setValue, reset } = useLocalStorage<ContrastCheckerState>("tool-contrast-checker", {
    foreground: DEFAULT_FOREGROUND,
    background: DEFAULT_BACKGROUND,
    sample: "Craft beautiful color pairs with confidence.",
  });
  const { notify } = useToast();

  const result = useMemo(() => {
    const foreground = parse(value.foreground.trim() || DEFAULT_FOREGROUND);
    const background = parse(value.background.trim() || DEFAULT_BACKGROUND);

    if (!foreground || !background) {
      return { error: "Enter valid HEX colors", data: null as ContrastResult | null } as const;
    }

    const contrast = getContrast(foreground, background);
    if (!contrast) {
      return { error: "Unable to compute contrast", data: null as ContrastResult | null } as const;
    }

    return { error: null, data: contrast } as const;
  }, [value.background, value.foreground]);

  const handleReset = () => {
    reset();
    notify("Contrast checker reset");
  };

  const ratioLabel = result.data ? `${result.data.ratio.toFixed(2)} : 1` : "--";
  const paletteCopy = result.data
    ? `Foreground: ${value.foreground}\nBackground: ${value.background}\nContrast ratio: ${result.data.ratio.toFixed(2)}:1`
    : `${value.foreground}\n${value.background}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {[{ label: "Foreground", key: "foreground" as const }, { label: "Background", key: "background" as const }].map((entry) => (
              <div key={entry.key} className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</span>
                  <CopyButton value={value[entry.key]} label="Copy" variant="outline" />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value[entry.key]}
                    onChange={(event) => setValue({ ...value, [entry.key]: event.target.value })}
                    className="h-14 w-14 cursor-pointer appearance-none rounded-2xl border border-[var(--surface-border)]/60 bg-transparent p-0"
                    aria-label={`Pick ${entry.label.toLowerCase()} color`}
                  />
                  <input
                    value={value[entry.key]}
                    onChange={(event) => setValue({ ...value, [entry.key]: event.target.value })}
                    spellCheck={false}
                    className="flex-1 rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Preview</span>
              <CopyButton value={value.sample} label="Copy text" variant="outline" />
            </div>
            <textarea
              value={value.sample}
              onChange={(event) => setValue({ ...value, sample: event.target.value })}
              spellCheck={false}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              rows={3}
            />
            <div
              className="rounded-3xl border border-[var(--surface-border)]/60 p-6 text-lg font-medium transition"
              style={{ color: value.foreground, background: value.background }}
            >
              {value.sample || "Sample text"}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Contrast analysis</p>
            <CopyButton value={paletteCopy} label="Copy summary" variant="outline" />
          </div>

          {result.error ? <ToolError message={result.error} /> : null}

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-5 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Contrast ratio</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{ratioLabel}</p>
            </div>

            <div className="space-y-2">
              {result.data?.evaluations.map((evaluation) => (
                <div
                  key={evaluation.label}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    evaluation.pass
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/40 bg-red-500/10 text-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
                    <span>{evaluation.label}</span>
                    <span>{evaluation.pass ? "Pass" : "Fail"}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[var(--foreground)]">
                    Needs ≥ {evaluation.requirement.toFixed(2)} : 1 &middot; {evaluation.description}
                  </p>
                </div>
              ))}
            </div>
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
