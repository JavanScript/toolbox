"use client";

import { useMemo } from "react";
import { converter, formatHex, parse } from "culori";
import type { CuloriColor } from "culori";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ColorShadesState {
  color: string;
  steps: number;
}

interface ShadesResult {
  tints: string[];
  base: string;
  shades: string[];
}

const DEFAULT_COLOR = "#22D3EE";
const MIN_STEPS = 3;
const MAX_STEPS = 6;

const toHsl = converter("hsl");
const toSrgb = converter("srgb");

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toHex(color: CuloriColor) {
  const srgb = toSrgb(color);
  if (!srgb) {
    return null;
  }
  return formatHex(srgb).toUpperCase();
}

function createTints(base: ReturnType<typeof toHsl>, steps: number) {
  const baseHue = base?.h ?? 0;
  const baseSaturation = base?.s ?? 0;
  const baseLightness = base?.l ?? 0;

  return Array.from({ length: steps }, (_, index) => {
    const weight = (index + 1) / (steps + 1);
    const lightness = clamp(baseLightness + (1 - baseLightness) * weight, 0, 1);
    const saturation = clamp(baseSaturation * (1 - weight * 0.35), 0, 1);
    return { mode: "hsl", h: baseHue, s: saturation, l: lightness } as CuloriColor;
  });
}

function createShades(base: ReturnType<typeof toHsl>, steps: number) {
  const baseHue = base?.h ?? 0;
  const baseSaturation = base?.s ?? 0;
  const baseLightness = base?.l ?? 0;

  return Array.from({ length: steps }, (_, index) => {
    const weight = (index + 1) / (steps + 1);
    const lightness = clamp(baseLightness * (1 - weight), 0, 1);
    const saturation = clamp(baseSaturation + (1 - baseSaturation) * weight * 0.25, 0, 1);
    return { mode: "hsl", h: baseHue, s: saturation, l: lightness } as CuloriColor;
  });
}

export function ColorShades() {
  const { value, setValue, reset } = useLocalStorage<ColorShadesState>("tool-color-shades", {
    color: DEFAULT_COLOR,
    steps: 5,
  });
  const { notify } = useToast();

  const result = useMemo(() => {
    const parsed = parse(value.color.trim() || DEFAULT_COLOR);
    if (!parsed) {
      return { error: "Enter a valid HEX color", data: null as ShadesResult | null } as const;
    }

    const hsl = toHsl(parsed);
    if (!hsl) {
      return { error: "Unable to interpret color", data: null as ShadesResult | null } as const;
    }

    const tints = createTints(hsl, value.steps)
      .map(toHex)
      .filter((hex): hex is string => typeof hex === "string")
      .reverse();

    const baseHex = toHex(hsl);
    if (!baseHex) {
      return { error: "Unable to format color", data: null as ShadesResult | null } as const;
    }

    const shades = createShades(hsl, value.steps)
      .map(toHex)
      .filter((hex): hex is string => typeof hex === "string");

    return {
      error: null,
      data: {
        tints,
        base: baseHex,
        shades,
      },
    } as const;
  }, [value.color, value.steps]);

  const handleReset = () => {
    reset();
    notify("Color shades reset");
  };

  const paletteCopy = result.data
    ? [...result.data.tints, result.data.base, ...result.data.shades].join("\n")
    : value.color;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Base color</span>
            <CopyButton value={value.color} label="Copy" variant="outline" />
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <input
              type="color"
              value={value.color}
              onChange={(event) => setValue({ ...value, color: event.target.value })}
              className="h-16 w-16 flex-shrink-0 cursor-pointer appearance-none rounded-2xl border border-[var(--surface-border)]/60 bg-transparent p-0"
              aria-label="Pick base color"
            />
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HEX</span>
                <input
                  value={value.color}
                  onChange={(event) => setValue({ ...value, color: event.target.value })}
                  spellCheck={false}
                  className="w-40 rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Steps</span>
                <input
                  type="range"
                  min={MIN_STEPS}
                  max={MAX_STEPS}
                  step={1}
                  value={value.steps}
                  onChange={(event) => setValue({ ...value, steps: Number(event.target.value) })}
                  className="w-48 accent-[var(--accent)]"
                />
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{value.steps} shades each side</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Preview</p>
            <div className="flex flex-col gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
              <div className="flex flex-wrap gap-3">
                {result.data?.tints.map((hex) => (
                  <div key={`tint-${hex}`} className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-2xl border border-[var(--surface-border)]/40" style={{ background: hex }} />
                    <CopyButton value={hex} label={hex} variant="ghost" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.82)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                  Base
                </span>
                {result.data ? (
                  <CopyButton value={result.data.base} label={result.data.base} variant="outline" />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {result.data?.shades.map((hex) => (
                  <div key={`shade-${hex}`} className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-2xl border border-[var(--surface-border)]/40" style={{ background: hex }} />
                    <CopyButton value={hex} label={hex} variant="ghost" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Generated palette</p>
            {result.data ? <CopyButton value={paletteCopy} label="Copy hex list" variant="outline" /> : null}
          </div>

          {result.error ? <ToolError message={result.error} /> : null}

          {result.data ? (
            <div className="space-y-3 text-sm text-[var(--foreground)]">
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))" }}>
                {[...result.data.tints, result.data.base, ...result.data.shades].map((hex, index) => (
                  <div
                    key={`${hex}-${index}`}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4"
                  >
                    <div className="h-16 w-full rounded-xl border border-[var(--surface-border)]/40" style={{ background: hex }} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px]">{hex}</span>
                      <CopyButton value={hex} label="Copy" variant="ghost" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.7)] p-4 text-sm text-[var(--foreground-muted)]">
              Shades will appear here
            </div>
          )}
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
