"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface DurationState {
  seconds: string;
  start: string;
  end: string;
  human: string;
  iso: string;
  breakdown: Record<string, number>;
  error: string | null;
}

const UNITS = [
  { label: "week", seconds: 604800 },
  { label: "day", seconds: 86400 },
  { label: "hour", seconds: 3600 },
  { label: "minute", seconds: 60 },
  { label: "second", seconds: 1 },
];

function formatHuman(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    throw new Error("Duration must be a non-negative number.");
  }
  if (totalSeconds === 0) {
    return {
      human: "0 seconds",
      iso: "PT0S",
      breakdown: { week: 0, day: 0, hour: 0, minute: 0, second: 0 },
    };
  }

  let remaining = Math.floor(totalSeconds);
  const parts: string[] = [];
  const breakdown: Record<string, number> = {};

  for (const unit of UNITS) {
    const value = Math.floor(remaining / unit.seconds);
    remaining -= value * unit.seconds;
    breakdown[unit.label] = value;
    if (value > 0) {
      parts.push(`${value} ${unit.label}${value === 1 ? "" : "s"}`);
    }
  }

  const totalDays = breakdown.week * 7 + breakdown.day;
  const timePortion = [
    breakdown.hour ? `${breakdown.hour}H` : "",
    breakdown.minute ? `${breakdown.minute}M` : "",
    breakdown.second ? `${breakdown.second}S` : "",
  ].join("");

  const iso = `P${totalDays ? `${totalDays}D` : ""}${timePortion ? `T${timePortion}` : totalDays ? "" : "T0S"}`;

  return {
    human: parts.join(", "),
    iso,
    breakdown,
  };
}

const SAMPLE_SECONDS = "987654";

const INITIAL_DURATION: DurationState = (() => {
  const { human, iso, breakdown } = formatHuman(Number(SAMPLE_SECONDS));
  return {
    seconds: SAMPLE_SECONDS,
    start: "",
    end: "",
    human,
    iso,
    breakdown,
    error: null,
  };
})();

export function EpochDurationTool() {
  const { value, setValue, reset } = useLocalStorage<DurationState>("tool-epoch-duration", INITIAL_DURATION);
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const secondsText = value.seconds.trim();
      const startText = value.start.trim();
      const endText = value.end.trim();
      let totalSeconds: number | null = null;

      if (secondsText) {
        const parsed = Number(secondsText);
        if (!Number.isFinite(parsed)) {
          throw new Error("Enter a valid number of seconds.");
        }
        totalSeconds = parsed;
      }

      if (startText || endText) {
        if (!(startText && endText)) {
          throw new Error("Provide both start and end epochs to compute a difference.");
        }
        const start = Number(startText);
        const end = Number(endText);
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
          throw new Error("Start and end epochs must be numeric.");
        }
        const delta = end - start;
        if (delta < 0) {
          throw new Error("End epoch must be greater than start epoch.");
        }
        totalSeconds = delta;
      }

      if (totalSeconds == null) {
        throw new Error("Enter seconds or provide start/end epochs.");
      }

      const { human, iso, breakdown } = formatHuman(totalSeconds);
      setValue({ ...value, human, iso, breakdown, error: null, seconds: String(totalSeconds) });
      notify("Duration calculated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to compute duration." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Duration tool reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex flex-col gap-2 text-sm text-[var(--foreground-muted)]">
              <span className="text-xs uppercase tracking-[0.3em]">Duration (seconds)</span>
              <input
                value={value.seconds}
                onChange={(event) => setValue({ ...value, seconds: event.target.value, error: null })}
                inputMode="numeric"
                className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="e.g. 3600"
              />
            </label>
          </div>
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Calculate from epochs</p>
            <div className="mt-3 grid gap-3">
              <input
                value={value.start}
                onChange={(event) => setValue({ ...value, start: event.target.value, error: null })}
                inputMode="numeric"
                className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.85)] px-4 py-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="Start epoch (seconds)"
              />
              <input
                value={value.end}
                onChange={(event) => setValue({ ...value, end: event.target.value, error: null })}
                inputMode="numeric"
                className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.85)] px-4 py-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="End epoch (seconds)"
              />
            </div>
            <p className="mt-3 text-xs text-[var(--foreground-muted)]">
              Provide both start and end Unix epochs (seconds) to compute the elapsed duration automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const { human, iso, breakdown } = formatHuman(Number(SAMPLE_SECONDS));
              setValue({
                ...INITIAL_DURATION,
                human,
                iso,
                breakdown,
                error: null,
                start: "1704067200",
                end: String(1704067200 + Number(SAMPLE_SECONDS)),
              });
              notify("Sample duration loaded");
            }}
            className="text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load sample
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Human readable</span>
              <CopyButton value={value.human} label="Copy" variant="ghost" />
            </div>
            <p className="mt-3 text-lg font-medium text-[var(--foreground)]">{value.human || "—"}</p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.72)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">ISO 8601</span>
              <CopyButton value={value.iso} label="Copy" variant="ghost" />
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]">{value.iso}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {UNITS.map((unit) => (
                <div key={unit.label} className="rounded-2xl border border-[var(--surface-border)]/50 bg-[rgba(10,12,20,0.85)] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{unit.label}</p>
                  <p className="mt-1 font-mono text-base text-[var(--foreground)]">{value.breakdown[unit.label] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Calculate duration
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
