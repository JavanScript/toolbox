"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface ShadowLayer {
  id: string;
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

interface BoxShadowState {
  layers: ShadowLayer[];
  css: string;
  error: string | null;
}

function createId() {
  return Math.random().toString(36).slice(2, 8);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  if (Number.isNaN(bigint)) {
    return { r: 0, g: 0, b: 0 };
  }
  if (normalized.length === 3) {
    const r = (bigint >> 8) & 0xf;
    const g = (bigint >> 4) & 0xf;
    const b = bigint & 0xf;
    return { r: r * 17, g: g * 17, b: b * 17 };
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function serializeShadow(layers: ShadowLayer[]) {
  return layers
    .map((layer) => {
      const { r, g, b } = hexToRgb(layer.color);
      const rgba = `rgba(${r}, ${g}, ${b}, ${layer.opacity.toFixed(2)})`;
      const parts = [
        layer.inset ? "inset" : null,
        `${layer.offsetX}px`,
        `${layer.offsetY}px`,
        `${layer.blur}px`,
        `${layer.spread}px`,
        rgba,
      ];
      return parts.filter(Boolean).join(" ");
    })
    .join(", ");
}

const INITIAL_LAYERS: ShadowLayer[] = [
  {
    id: createId(),
    inset: false,
    offsetX: 0,
    offsetY: 18,
    blur: 40,
    spread: -12,
    color: "#000000",
    opacity: 0.35,
  },
  {
    id: createId(),
    inset: false,
    offsetX: 0,
    offsetY: 8,
    blur: 20,
    spread: -10,
    color: "#000000",
    opacity: 0.25,
  },
];

const INITIAL_STATE: BoxShadowState = {
  layers: INITIAL_LAYERS,
  css: serializeShadow(INITIAL_LAYERS),
  error: null,
};

export function CssBoxShadowGenerator() {
  const { value, setValue, reset } = useLocalStorage<BoxShadowState>("tool-box-shadow", INITIAL_STATE);
  const { notify } = useToast();

  const update = useCallback(
    (nextLayers: ShadowLayer[]) => {
      const css = serializeShadow(nextLayers);
      setValue({ layers: nextLayers, css, error: null });
    },
    [setValue]
  );

  const handleLayerChange = useCallback(
    (id: string, patch: Partial<ShadowLayer>) => {
      update(value.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
    },
    [update, value.layers]
  );

  const handleAddLayer = useCallback(() => {
    if (value.layers.length >= 6) {
      setValue({ ...value, error: "Limit of 6 layers reached." });
      return;
    }
    const layer: ShadowLayer = {
      id: createId(),
      inset: false,
      offsetX: 0,
      offsetY: 24,
      blur: 60,
      spread: -20,
      color: "#000000",
      opacity: 0.2,
    };
    update([...value.layers, layer]);
    notify("Shadow layer added");
  }, [notify, update, value]);

  const handleRemove = useCallback(
    (id: string) => {
      if (value.layers.length <= 1) {
        setValue({ ...value, error: "Keep at least one layer." });
        return;
      }
      update(value.layers.filter((layer) => layer.id !== id));
      notify("Layer removed");
    },
    [notify, update, value]
  );

  const handleReset = useCallback(() => {
    reset();
    notify("Box shadow reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          {value.layers.map((layer, index) => (
            <div key={layer.id} className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Layer #{index + 1}</p>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <input
                      type="checkbox"
                      checked={layer.inset}
                      onChange={(event) => handleLayerChange(layer.id, { inset: event.target.checked })}
                    />
                    Inset
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(layer.id)}
                    className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                {([
                  {
                    key: "offsetX",
                    label: "Offset X",
                    min: -100,
                    max: 100,
                  },
                  {
                    key: "offsetY",
                    label: "Offset Y",
                    min: -100,
                    max: 100,
                  },
                  {
                    key: "blur",
                    label: "Blur",
                    min: 0,
                    max: 200,
                  },
                  {
                    key: "spread",
                    label: "Spread",
                    min: -100,
                    max: 100,
                  },
                ] as Array<{
                  key: "offsetX" | "offsetY" | "blur" | "spread";
                  label: string;
                  min: number;
                  max: number;
                }>).map((config) => (
                  <label
                    key={config.key}
                    className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]"
                  >
                    {config.label}: {layer[config.key]}px
                    <input
                      type="range"
                      min={config.min}
                      max={config.max}
                      value={layer[config.key]}
                      onChange={(event) =>
                        handleLayerChange(layer.id, {
                          [config.key]: Number(event.target.value),
                        } as Partial<ShadowLayer>)
                      }
                    />
                  </label>
                ))}
                <div className="flex items-center gap-3">
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                    Color
                    <input
                      type="color"
                      value={layer.color}
                      onChange={(event) => handleLayerChange(layer.id, { color: event.target.value })}
                      className="h-12 w-12 cursor-pointer rounded-2xl border border-[var(--surface-border)]/60"
                    />
                  </label>
                  <label className="flex-1 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                    Opacity {(layer.opacity * 100).toFixed(0)}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(layer.opacity * 100)}
                      onChange={(event) => handleLayerChange(layer.id, { opacity: Number(event.target.value) / 100 })}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
          <ToolButton type="button" onClick={handleAddLayer} variant="secondary" className="w-full justify-center">
            Add layer
          </ToolButton>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center rounded-[32px] border border-[var(--surface-border)]/60 bg-[radial-gradient(circle_at_top,_rgba(88,166,255,0.12),_transparent_55%)] p-12">
            <div
              className="h-48 w-48 rounded-[28px] border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.9)]"
              style={{ boxShadow: value.css }}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">CSS box-shadow</span>
              <CopyButton value={`box-shadow: ${value.css};`} label="Copy" variant="outline" />
            </div>
            <textarea
              value={`box-shadow: ${value.css};`}
              readOnly
              spellCheck={false}
              className="min-h-[160px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={() => update(value.layers)}>
          Refresh preview
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
