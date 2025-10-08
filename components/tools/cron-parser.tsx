"use client";

import { useCallback } from "react";
import cronstrue from "cronstrue";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface CronParserState {
  expression: string;
  description: string;
  verbose: boolean;
  use24HourTime: boolean;
  sundayFirst: boolean;
  error: string | null;
  fields: Array<{ label: string; value: string }>;
}

const SAMPLE_CRON = "0 9 * * MON-FRI";

const FIELD_LABELS = [
  "Seconds",
  "Minutes",
  "Hours",
  "Day of month",
  "Month",
  "Day of week",
  "Year",
];

function buildFieldBreakdown(expression: string) {
  const parts = expression
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 5 || parts.length > 7) {
    return [];
  }

  const startIndex = parts.length === 5 ? 1 : 0;
  return parts.map((part, index) => ({
    label: FIELD_LABELS[startIndex + index] ?? `Field ${index + 1}`,
    value: part,
  }));
}

export function CronParserTool() {
  const { value, setValue, reset } = useLocalStorage<CronParserState>(
    "tool-cron-parser",
    {
      expression: SAMPLE_CRON,
      description: cronstrue.toString(SAMPLE_CRON, {
        verbose: false,
        use24HourTimeFormat: true,
      }),
      verbose: false,
      use24HourTime: true,
      sundayFirst: true,
      error: null,
      fields: buildFieldBreakdown(SAMPLE_CRON),
    }
  );
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const description = cronstrue.toString(value.expression, {
        verbose: value.verbose,
        use24HourTimeFormat: value.use24HourTime,
        dayOfWeekStartIndexZero: value.sundayFirst,
        throwExceptionOnParseError: true,
      });
      setValue({
        ...value,
        description,
        error: null,
        fields: buildFieldBreakdown(value.expression),
      });
      notify("Cron expression parsed");
    } catch (error) {
      setValue({
        ...value,
        error: error instanceof Error ? error.message : "Unable to parse cron expression.",
      });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Cron parser reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Cron expression
            </span>
            <button
              type="button"
              onClick={() => setValue({ ...value, expression: SAMPLE_CRON, error: null })}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <input
            value={value.expression}
            onChange={(event) => setValue({ ...value, expression: event.target.value })}
            spellCheck={false}
            className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="* * * * *"
          />
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            <span className="rounded-full border border-[var(--surface-border)]/60 px-3 py-1">
              Supports 5 or 6 fields
            </span>
            <span className="rounded-full border border-[var(--surface-border)]/60 px-3 py-1">
              Use ? for optional fields
            </span>
            <span className="rounded-full border border-[var(--surface-border)]/60 px-3 py-1">
              L,W,# helpers accepted
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Natural language
            </span>
            <CopyButton value={value.description} label="Copy description" variant="outline" />
          </div>
          <textarea
            value={value.description}
            readOnly
            spellCheck={false}
            className="min-h-[180px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]"
          />
        </div>
      </div>

      {value.fields.length > 0 ? (
        <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4">
          <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            Field breakdown
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {value.fields.map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--foreground-muted)]">
                  {field.label}
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--foreground)]">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.verbose}
            onChange={(event) => setValue({ ...value, verbose: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Verbose output
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.use24HourTime}
            onChange={(event) => setValue({ ...value, use24HourTime: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          24-hour time
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.sundayFirst}
            onChange={(event) => setValue({ ...value, sundayFirst: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Sunday = day 0
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Parse cron
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
