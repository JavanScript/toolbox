"use client";

import { useCallback, useMemo } from "react";
import { converter, formatHex, formatHsl, formatRgb, parse } from "culori";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ColorPickerState {
  hex: string;
  alpha: number;
  palette: string[];
  error: string | null;
}

const DEFAULT_COLOR = "#58A6FF";
const PRESET_SWATCHES = ["#58A6FF", "#22D3EE", "#10B981", "#F97316", "#F43F5E", "#A855F7"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ColorPickerTool() {
  const { value, setValue, reset } = useLocalStorage<ColorPickerState>("tool-color-picker", {
    hex: DEFAULT_COLOR,
    alpha: 100,
    palette: PRESET_SWATCHES,
    error: null,
  });
  const { notify } = useToast();

  const parsed = useMemo(() => {
    const color = parse(value.hex.trim() || DEFAULT_COLOR);
    if (!color) {
      return { error: "Enter a valid HEX color", formats: null } as const;
    }

    const alpha = clamp(value.alpha, 0, 100) / 100;
    const colorWithAlpha = { ...color, alpha };
    const hslColor = converter("hsl")(colorWithAlpha);
    const hwbColor = converter("hwb")(colorWithAlpha);

    const hsla = (() => {
      if (!hslColor) return "";
      const { h = 0, s = 0, l = 0 } = hslColor;
      return `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${alpha.toFixed(2)})`;
    })();

    const hwb = (() => {
      if (!hwbColor) return "";
      const { h = 0, w = 0, b = 0 } = hwbColor;
      const alphaSuffix = alpha < 1 ? ` / ${alpha.toFixed(2)}` : "";
      return `hwb(${Math.round(h)} ${Math.round(w * 100)}% ${Math.round(b * 100)}%${alphaSuffix})`;
    })();

    return {
      error: null,
      formats: {
        hex: formatHex(colorWithAlpha).toUpperCase(),
        rgba: formatRgb(colorWithAlpha),
        hsla,
        hwb,
        preview: formatHex(colorWithAlpha),
      },
    } as const;
  }, [value.alpha, value.hex]);

  const handleColorChange = useCallback(
    (hex: string) => {
      const normalized = hex.startsWith("#") ? hex : `#${hex}`;
      const parsedColor = parse(normalized);
      if (!parsedColor) {
        setValue({ ...value, hex: hex, error: "Enter a valid HEX color" });
        return;
      }

      const palette = [normalized.toUpperCase(), ...value.palette.filter((swatch) => swatch !== normalized.toUpperCase())]
        .slice(0, 8);

      setValue({ hex: normalized.toUpperCase(), alpha: clamp(value.alpha, 0, 100), palette, error: null });
      notify("Color updated");
    },
    [notify, setValue, value]
  );

  const handleReset = useCallback(() => {
    reset();
    notify("Color picker reset");
  }, [notify, reset]);

  const formats = parsed.formats;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Color</span>
            <CopyButton value={value.hex} label="Copy" variant="outline" />
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <input
              type="color"
              value={value.hex}
              onChange={(event) => handleColorChange(event.target.value)}
              className="h-16 w-16 flex-shrink-0 cursor-pointer appearance-none rounded-2xl border border-[var(--surface-border)]/60 bg-transparent p-0"
              aria-label="Pick a color"
            />
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HEX</span>
                <input
                  value={value.hex}
                  onChange={(event) => handleColorChange(event.target.value)}
                  spellCheck={false}
                  className="w-40 rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Alpha {value.alpha}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={value.alpha}
                  onChange={(event) => setValue({ ...value, alpha: Number(event.target.value) })}
                  className="w-40 accent-[var(--accent)]"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Recent colors</p>
            <div className="flex flex-wrap gap-3">
              {value.palette.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => handleColorChange(swatch)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--surface-border)]/60 transition hover:scale-[1.05]"
                  style={{ background: swatch }}
                  aria-label={`Use ${swatch}`}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Formats</p>
            {formats ? <CopyButton value={formats.hex} label="Copy hex" variant="outline" /> : null}
          </div>

          {parsed.error ? <ToolError message={parsed.error} /> : null}

          {formats ? (
            <div className="space-y-3 text-sm text-[var(--foreground)]">
              {[{ label: "HEX", value: formats.hex }, { label: "RGBA", value: formats.rgba }, { label: "HSLA", value: formats.hsla }, { label: "HWB", value: formats.hwb }].map((entry) => (
                <div key={entry.label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</p>
                    <p className="mt-1 font-mono text-[13px] text-[var(--foreground)] break-all">{entry.value}</p>
                  </div>
                  <CopyButton value={entry.value} label="Copy" variant="ghost" />
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      {formats ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Preview</p>
          <div
            className="h-32 rounded-3xl border border-[var(--surface-border)]/60"
            style={{ background: formats.preview }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
