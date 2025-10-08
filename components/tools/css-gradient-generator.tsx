"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface GradientStop {
  id: string;
  color: string;
  position: number;
}

interface GradientState {
  type: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
  css: string;
  error: string | null;
}

function createId() {
  return Math.random().toString(36).slice(2, 8);
}

function serializeGradient(state: GradientState) {
  const orderedStops = [...state.stops].sort((a, b) => a.position - b.position);
  const stopString = orderedStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");
  if (state.type === "linear") {
    return `linear-gradient(${state.angle}deg, ${stopString})`;
  }
  return `radial-gradient(circle, ${stopString})`;
}

const INITIAL_STOPS: GradientStop[] = [
  { id: createId(), color: "#3A1C71", position: 0 },
  { id: createId(), color: "#D76D77", position: 50 },
  { id: createId(), color: "#FFAF7B", position: 100 },
];

const INITIAL_STATE: GradientState = {
  type: "linear",
  angle: 135,
  stops: INITIAL_STOPS,
  css: serializeGradient({ type: "linear", angle: 135, stops: INITIAL_STOPS, css: "", error: null }),
  error: null,
};

export function CssGradientGenerator() {
  const { value, setValue, reset } = useLocalStorage<GradientState>("tool-gradient", INITIAL_STATE);
  const { notify } = useToast();

  const updateCss = useCallback(
    (next: GradientState) => {
      const css = serializeGradient(next);
      setValue({ ...next, css });
    },
    [setValue]
  );

  const handleStopChange = useCallback(
    (id: string, patch: Partial<GradientStop>) => {
      const stops = value.stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop));
      updateCss({ ...value, stops, error: null });
    },
    [updateCss, value]
  );

  const handleAddStop = useCallback(() => {
    if (value.stops.length >= 6) {
      setValue({ ...value, error: "Limit of 6 color stops reached." });
      return;
    }
    const position = Math.round(
      (value.stops.reduce((acc, stop) => acc + stop.position, 0) / value.stops.length + 10) % 100
    );
    const newStop: GradientStop = {
      id: createId(),
      color: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      position: Math.min(100, Math.max(0, position)),
    };
    updateCss({ ...value, stops: [...value.stops, newStop], error: null });
    notify("Color stop added");
  }, [notify, updateCss, value]);

  const handleRemove = useCallback(
    (id: string) => {
      if (value.stops.length <= 2) {
        setValue({ ...value, error: "A gradient requires at least two stops." });
        return;
      }
      updateCss({ ...value, stops: value.stops.filter((stop) => stop.id !== id), error: null });
      notify("Color stop removed");
    },
    [notify, updateCss, value]
  );

  const handleReset = useCallback(() => {
    reset();
    notify("Gradient reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Gradient type</p>
            <div className="mt-4 flex gap-3">
              {[{ label: "Linear", value: "linear" }, { label: "Radial", value: "radial" }].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateCss({ ...value, type: option.value as GradientState["type"], error: null })}
                  className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    value.type === option.value
                      ? "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.2)] text-[var(--foreground)]"
                      : "border-[var(--surface-border)]/60 text-[var(--foreground-muted)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {value.type === "linear" ? (
              <label className="mt-5 flex flex-col gap-3 rounded-2xl border border-[var(--surface-border)]/50 bg-[rgba(10,12,20,0.82)] px-4 py-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                  <span>Angle</span>
                  <span className="font-mono text-sm text-[var(--foreground)]">{value.angle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={value.angle}
                  onChange={(event) => updateCss({ ...value, angle: Number(event.target.value), error: null })}
                />
              </label>
            ) : null}
          </div>

          <div className="space-y-3">
            {value.stops
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((stop, index) => (
                <div
                  key={stop.id}
                  className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Stop #{index + 1}</p>
                    <button
                      type="button"
                      onClick={() => handleRemove(stop.id)}
                      className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(event) => handleStopChange(stop.id, { color: event.target.value })}
                      className="h-12 w-12 cursor-pointer rounded-2xl border border-[var(--surface-border)]/60 bg-transparent"
                    />
                    <div className="flex-1">
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                        Position ({stop.position}%)
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={stop.position}
                          onChange={(event) => handleStopChange(stop.id, { position: Number(event.target.value) })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            <ToolButton type="button" onClick={handleAddStop} variant="secondary" className="w-full justify-center">
              Add color stop
            </ToolButton>
          </div>
        </div>
        <div className="space-y-4">
          <div
            className="h-[320px] rounded-[32px] border border-[var(--surface-border)]/60 shadow-[0_40px_120px_-60px_var(--glow)]"
            style={{ background: value.css }}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">CSS gradient</span>
              <CopyButton value={value.css} label="Copy" variant="outline" />
            </div>
            <textarea
              value={`background-image: ${value.css};`}
              readOnly
              spellCheck={false}
              className="min-h-[160px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={() => updateCss({ ...value, error: null })}>
          Refresh preview
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
