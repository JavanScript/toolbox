"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface TimestampState {
  unix: string;
  iso: string;
  error: string | null;
}

function formatRelative(epochMs: number) {
  const delta = epochMs - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absDelta = Math.abs(delta);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];
  for (const [unit, value] of units) {
    if (absDelta >= value || unit === "second") {
      return formatter.format(Math.round(delta / value), unit);
    }
  }
  return "now";
}

export function TimestampConverter() {
  const { value, setValue, reset } = useLocalStorage<TimestampState>("tool-timestamp", {
    unix: "",
    iso: "",
    error: null,
  });
  const [mode, setMode] = useState<"seconds" | "milliseconds">("seconds");
  const { notify } = useToast();

  const syncFromUnix = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setValue({ unix: "", iso: "", error: null });
        return;
      }

      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        setValue({ unix: raw, iso: value.iso, error: "Enter a valid number." });
        return;
      }

      const epochMs = mode === "seconds" ? numeric * 1000 : numeric;
      const date = new Date(epochMs);
      if (Number.isNaN(date.getTime())) {
        setValue({ unix: raw, iso: value.iso, error: "Unable to convert to a valid date." });
        return;
      }

      setValue({ unix: raw, iso: date.toISOString(), error: null });
      notify(`Converted ${mode === "seconds" ? "seconds" : "milliseconds"} to ISO`);
    },
    [mode, notify, setValue, value.iso]
  );

  const syncFromIso = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setValue({ unix: "", iso: "", error: null });
        return;
      }

      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) {
        setValue({ unix: value.unix, iso: raw, error: "Enter a valid ISO 8601 date." });
        return;
      }

      const unixValue = mode === "seconds" ? Math.floor(date.getTime() / 1000) : date.getTime();
      setValue({ unix: String(unixValue), iso: date.toISOString(), error: null });
      notify("Converted ISO to Unix");
    },
    [mode, notify, setValue, value.unix]
  );

  const handleToggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "seconds" ? "milliseconds" : "seconds";
      if (value.unix) {
        const numeric = Number(value.unix);
        if (Number.isFinite(numeric)) {
          const epochMs = prev === "seconds" ? numeric * 1000 : numeric;
          const convertedUnix = next === "seconds" ? Math.floor(epochMs / 1000) : epochMs;
          setValue({ unix: String(convertedUnix), iso: value.iso, error: null });
        }
      }
      return next;
    });
    notify("Timestamp mode toggled");
  }, [notify, setMode, setValue, value.iso, value.unix]);

  const handleNow = useCallback(() => {
    const now = new Date();
    setValue({
      unix: mode === "seconds" ? String(Math.floor(now.getTime() / 1000)) : String(now.getTime()),
      iso: now.toISOString(),
      error: null,
    });
    notify("Populated with current time");
  }, [mode, notify, setValue]);

  const relative = useMemo(() => {
    if (!value.iso) return null;
    const date = new Date(value.iso);
    if (Number.isNaN(date.getTime())) return null;
    return formatRelative(date.getTime());
  }, [value.iso]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Unix timestamp ({mode === "seconds" ? "s" : "ms"})
            </span>
            <CopyButton value={value.unix} label="Copy" variant="ghost" />
          </div>
          <input
            value={value.unix}
            onChange={(event) => {
              syncFromUnix(event.target.value);
            }}
            inputMode="numeric"
            className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder={mode === "seconds" ? "e.g. 1706822400" : "e.g. 1706822400000"}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">ISO 8601</span>
            <CopyButton value={value.iso} label="Copy" variant="ghost" />
          </div>
          <input
            value={value.iso}
            onChange={(event) => {
              syncFromIso(event.target.value);
            }}
            className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="e.g. 2024-02-01T00:00:00.000Z"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      {relative ? (
        <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.5)] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Relative to now</p>
          <p className="mt-2 text-sm text-[var(--foreground)]">{relative}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleToggleMode} variant="secondary">
          {mode === "seconds" ? "Switch to milliseconds" : "Switch to seconds"}
        </ToolButton>
        <ToolButton type="button" onClick={handleNow}>
          Use current time
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => {
            reset();
            setMode("seconds");
            notify("Timestamp converter reset");
          }}
          variant="ghost"
        >
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
