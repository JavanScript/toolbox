"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

type CssUnit = "px" | "rem" | "em" | "%" | "pt";
type ResultKey = "px" | "rem" | "em" | "percent" | "pt" | "cm" | "inch";

interface CssUnitResults {
  px: string;
  rem: string;
  em: string;
  percent: string;
  pt: string;
  cm: string;
  inch: string;
}

interface CssUnitState {
  inputValue: string;
  unit: CssUnit;
  baseFontSize: string;
  contextFontSize: string;
  referenceSize: string;
  results: CssUnitResults;
  error: string | null;
}

const DEFAULT_RESULTS: CssUnitResults = {
  px: "16",
  rem: "1",
  em: "1",
  percent: "5",
  pt: "12",
  cm: "0.42",
  inch: "0.17",
};

const DEFAULT_STATE: CssUnitState = {
  inputValue: "16",
  unit: "px",
  baseFontSize: "16",
  contextFontSize: "16",
  referenceSize: "320",
  results: DEFAULT_RESULTS,
  error: null,
};

function toNumber(value: string, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalise(value: number, fractionDigits: number) {
  const formatted = value.toFixed(fractionDigits);
  return formatted.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function CssUnitConverter() {
  const { value, setValue, reset } = useLocalStorage<CssUnitState>("tool-css-units", DEFAULT_STATE);
  const { notify } = useToast();

  const run = useCallback(() => {
    const rawValue = Number(value.inputValue);
    if (!Number.isFinite(rawValue)) {
      setValue({ ...value, error: "Enter a numeric value to convert." });
      return;
    }

    const baseFont = toNumber(value.baseFontSize, 16);
    const contextFont = toNumber(value.contextFontSize, baseFont);
    const reference = toNumber(value.referenceSize, 320);

    let px = rawValue;
    switch (value.unit) {
      case "rem":
        px = rawValue * baseFont;
        break;
      case "em":
        px = rawValue * contextFont;
        break;
      case "%":
        px = reference === 0 ? 0 : (rawValue / 100) * reference;
        break;
      case "pt":
        px = rawValue * (96 / 72);
        break;
      default:
        px = rawValue;
    }

    const rem = baseFont === 0 ? 0 : px / baseFont;
    const em = contextFont === 0 ? 0 : px / contextFont;
    const percent = reference === 0 ? 0 : (px / reference) * 100;
    const pt = px * (72 / 96);
    const cm = px * (2.54 / 96);
    const inch = px / 96;

    const results: CssUnitResults = {
      px: normalise(px, 4),
      rem: normalise(rem, 4),
      em: normalise(em, 4),
      percent: normalise(percent, 2),
      pt: normalise(pt, 2),
      cm: normalise(cm, 3),
      inch: normalise(inch, 3),
    };

    setValue({
      ...value,
      results,
      error: null,
    });
    notify("CSS units converted");
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("CSS unit converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Value</span>
            <input
              value={value.inputValue}
              onChange={(event) => setValue({ ...value, inputValue: event.target.value, error: null })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Enter numeric value"
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Unit</span>
            <select
              value={value.unit}
              onChange={(event) => setValue({ ...value, unit: event.target.value as CssUnit })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] p-4 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            >
              <option value="px">Pixels (px)</option>
              <option value="rem">Root em (rem)</option>
              <option value="em">Element em (em)</option>
              <option value="%">Percent (%)</option>
              <option value="pt">Points (pt)</option>
            </select>
          </label>
        </div>
        <div className="space-y-4">
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Root font size (px)</span>
            <input
              value={value.baseFontSize}
              onChange={(event) => setValue({ ...value, baseFontSize: event.target.value })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Current element font size (px)</span>
            <input
              value={value.contextFontSize}
              onChange={(event) => setValue({ ...value, contextFontSize: event.target.value })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Reference size for % (px)</span>
            <input
              value={value.referenceSize}
              onChange={(event) => setValue({ ...value, referenceSize: event.target.value })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Pixels", key: "px" as ResultKey },
          { label: "Root em (rem)", key: "rem" as ResultKey },
          { label: "Element em (em)", key: "em" as ResultKey },
          { label: "Percent", key: "percent" as ResultKey },
          { label: "Points", key: "pt" as ResultKey },
          { label: "Centimeters", key: "cm" as ResultKey },
          { label: "Inches", key: "inch" as ResultKey },
        ].map((entry) => (
          <div key={entry.key} className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</p>
              <CopyButton value={value.results[entry.key]} label="Copy" variant="ghost" />
            </div>
            <p className="mt-3 font-mono text-sm text-[var(--foreground)] break-words">
              {value.results[entry.key] || "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert units
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
