"use client";

import { useCallback } from "react";
import { converter, formatHex, formatRgb, parse } from "culori";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface ColorState {
  input: string;
  results: {
    hex: string;
    rgb: string;
    hsl: string;
    hwb: string;
  };
  error: string | null;
}

const SAMPLE = "#58a6ff";

export function ColorFormatConverter() {
  const { value, setValue, reset } = useLocalStorage<ColorState>("tool-color-format", {
    input: SAMPLE,
    results: {
      hex: "#58A6FF",
      rgb: "rgb(88, 166, 255)",
      hsl: "hsl(214, 100%, 67%)",
      hwb: "hwb(214 34% 0%)",
    },
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    const color = parse(value.input.trim() || SAMPLE);
    if (!color) {
      setValue({ ...value, error: "Enter a valid color (HEX, RGB, HSL, etc.)." });
      return;
    }

    const hex = formatHex(color).toUpperCase();
    const rgb = formatRgb(color);
    const toHsl = converter("hsl");
    const hslColor = toHsl(color);
    const hsl = hslColor
      ? `hsl(${Math.round(hslColor.h ?? 0)}, ${Math.round((hslColor.s ?? 0) * 100)}%, ${Math.round((hslColor.l ?? 0) * 100)}%)`
      : "";
    const toHwb = converter("hwb");
    const hwbColor = toHwb(color);
    const hwb = hwbColor
      ? `hwb(${Math.round(hwbColor.h ?? 0)} ${Math.round((hwbColor.w ?? 0) * 100)}% ${Math.round((hwbColor.b ?? 0) * 100)}%)`
      : "";

    setValue({
      input: value.input,
      results: {
        hex,
        rgb,
        hsl,
        hwb,
      },
      error: null,
    });
    notify("Color converted");
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Color converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input color</span>
          <button
            type="button"
            onClick={() => {
              setValue({ ...value, input: SAMPLE, error: null });
              notify("Sample color loaded");
            }}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load sample
          </button>
        </div>
        <input
          value={value.input}
          onChange={(event) => setValue({ ...value, input: event.target.value, error: null })}
          className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          placeholder="#58a6ff, rgb(88,166,255), hsl(214, 100%, 67%), etc."
        />
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "HEX", value: value.results.hex },
          { label: "RGB", value: value.results.rgb },
          { label: "HSL", value: value.results.hsl },
          { label: "HWB", value: value.results.hwb },
        ].map((entry) => (
          <div key={entry.label} className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</p>
              <CopyButton value={entry.value} label="Copy" variant="ghost" />
            </div>
            <p className="mt-3 font-mono text-sm text-[var(--foreground)] break-words">{entry.value || "—"}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert formats
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
