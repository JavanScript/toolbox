"use client";

import { useMemo } from "react";
import { converter, formatHex, parse } from "culori";
import type { CuloriColor } from "culori";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface PaletteGeneratorState {
  color: string;
  harmony: Harmony;
}

type Harmony =
  | "analogous"
  | "complementary"
  | "split"
  | "triadic"
  | "tetradic"
  | "monochromatic";

const DEFAULT_COLOR = "#58A6FF";

const HARMONY_OPTIONS: Array<{
  id: Harmony;
  label: string;
  description: string;
}> = [
  { id: "analogous", label: "Analogous", description: "Neighboring hues on the color wheel" },
  { id: "complementary", label: "Complementary", description: "Opposites that create strong contrast" },
  { id: "split", label: "Split complementary", description: "Complement plus its adjacent hues" },
  { id: "triadic", label: "Triadic", description: "Three colors evenly spaced (120° apart)" },
  { id: "tetradic", label: "Tetradic", description: "Four colors forming a rectangle (90° steps)" },
  { id: "monochromatic", label: "Monochromatic", description: "Single hue with varied lightness" },
];

const toHsl = converter("hsl");

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shiftHue(baseHue: number | undefined, offset: number) {
  const hue = (baseHue ?? 0) + offset;
  const normalized = ((hue % 360) + 360) % 360;
  return normalized;
}

function adjustLightness(lightness: number | undefined, delta: number) {
  const value = clamp((lightness ?? 0) + delta, 0, 1);
  return value;
}

function createPalette(hslColor: Exclude<ReturnType<typeof toHsl>, null>, harmony: Harmony) {
  const baseHue = hslColor?.h ?? 0;
  const saturation = hslColor?.s ?? 0;
  const lightness = hslColor?.l ?? 0;

  const colors = {
    analogous: [-40, -20, 0, 20, 40].map((offset) => ({ mode: "hsl", h: shiftHue(baseHue, offset), s: saturation, l: lightness })),
    complementary: [
      { mode: "hsl", h: shiftHue(baseHue, 0), s: saturation, l: lightness },
      { mode: "hsl", h: shiftHue(baseHue, 180), s: saturation, l: lightness },
      { mode: "hsl", h: shiftHue(baseHue, 150), s: saturation, l: lightness },
      { mode: "hsl", h: shiftHue(baseHue, 210), s: saturation, l: lightness },
      { mode: "hsl", h: shiftHue(baseHue, 30), s: saturation, l: lightness },
    ],
    split: [-30, 0, 30, 150, 210].map((offset) => ({ mode: "hsl", h: shiftHue(baseHue, offset), s: saturation, l: lightness })),
    triadic: [0, 60, 120, 240, 300].map((offset) => ({ mode: "hsl", h: shiftHue(baseHue, offset), s: saturation, l: lightness })),
    tetradic: [0, 90, 180, 270, 45].map((offset) => ({ mode: "hsl", h: shiftHue(baseHue, offset), s: saturation, l: lightness })),
    monochromatic: [-0.25, -0.12, 0, 0.12, 0.24].map((delta) => ({
      mode: "hsl",
      h: baseHue,
      s: saturation,
      l: adjustLightness(lightness, delta),
    })),
  };

  return colors[harmony];
}

function toHex(color: CuloriColor) {
  const srgb = converter("srgb")(color);
  if (!srgb) {
    return null;
  }
  return formatHex(srgb).toUpperCase();
}

export function PaletteGenerator() {
  const { value, setValue, reset } = useLocalStorage<PaletteGeneratorState>("tool-palette-generator", {
    color: DEFAULT_COLOR,
    harmony: "analogous",
  });
  const { notify } = useToast();

  const result = useMemo(() => {
    const parsed = parse(value.color.trim() || DEFAULT_COLOR);
    if (!parsed) {
      return { error: "Enter a valid HEX color", palette: [] as string[] } as const;
    }

    const hsl = toHsl(parsed);
    if (!hsl) {
      return { error: "Unable to interpret color", palette: [] as string[] } as const;
    }

    const harmonies = createPalette(hsl, value.harmony)
      .map(toHex)
      .filter((hex): hex is string => typeof hex === "string")
      .filter((hex, index, array) => array.indexOf(hex) === index);

    return { error: null, palette: harmonies } as const;
  }, [value.color, value.harmony]);

  const handleColorChange = (hex: string) => {
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    setValue({ ...value, color: normalized.toUpperCase() });
  };

  const handleReset = () => {
    reset();
    notify("Palette generator reset");
  };

  const paletteString = result.palette.join("\n");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Base color</span>
            <CopyButton value={value.color} label="Copy" variant="outline" />
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <input
              type="color"
              value={value.color}
              onChange={(event) => handleColorChange(event.target.value)}
              className="h-16 w-16 flex-shrink-0 cursor-pointer appearance-none rounded-2xl border border-[var(--surface-border)]/60 bg-transparent p-0"
              aria-label="Pick base color"
            />
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HEX</span>
                <input
                  value={value.color}
                  onChange={(event) => handleColorChange(event.target.value)}
                  spellCheck={false}
                  className="w-40 rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Harmony</span>
                <select
                  value={value.harmony}
                  onChange={(event) => setValue({ ...value, harmony: event.target.value as Harmony })}
                  className="w-56 rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                >
                  {HARMONY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">About this harmony</p>
            <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              {HARMONY_OPTIONS.find((option) => option.id === value.harmony)?.description}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Palette</p>
            {result.palette.length > 0 ? <CopyButton value={paletteString} label="Copy hex list" variant="outline" /> : null}
          </div>

          {result.error ? <ToolError message={result.error} /> : null}

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))" }}>
            {result.palette.map((hex) => (
              <div
                key={hex}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-sm text-[var(--foreground)]"
              >
                <div className="h-16 w-full rounded-xl border border-[var(--surface-border)]/40" style={{ background: hex }} />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[13px]">{hex}</span>
                  <CopyButton value={hex} label="Copy" variant="ghost" />
                </div>
              </div>
            ))}
            {result.palette.length === 0 ? (
              <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.7)] p-4 text-sm text-[var(--foreground-muted)]">
                Palette will appear here
              </div>
            ) : null}
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
