"use client";

import { useCallback } from "react";
import { format, FormatOptionsWithLanguage, SqlLanguage } from "sql-formatter";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface SqlState {
  input: string;
  output: string;
  dialect: SqlLanguage;
  uppercase: boolean;
  tabWidth: number;
  error: string | null;
}

const SAMPLE_SQL = `SELECT
  users.id,
  users.email,
  COUNT(sessions.id) AS session_count
FROM users
LEFT JOIN sessions ON sessions.user_id = users.id
WHERE users.status = 'active'
GROUP BY users.id, users.email
ORDER BY session_count DESC
LIMIT 25;`;

const DIALECTS: Array<{ label: string; value: SqlLanguage }> = [
  { label: "Standard SQL", value: "sql" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MySQL", value: "mysql" },
  { label: "SQLite", value: "sqlite" },
  { label: "BigQuery", value: "bigquery" },
];

export function SqlFormatterTool() {
  const { value, setValue, reset } = useLocalStorage<SqlState>("tool-sql-formatter", {
    input: SAMPLE_SQL,
    output: format(SAMPLE_SQL, { language: "sql", keywordCase: "upper" }),
    dialect: "sql",
    uppercase: true,
    tabWidth: 2,
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const options: FormatOptionsWithLanguage = {
        language: value.dialect,
        keywordCase: value.uppercase ? "upper" : "preserve",
        indentStyle: "standard",
        tabWidth: value.tabWidth,
      };
      const result = format(value.input, options);
      setValue({ ...value, output: result, error: null });
      notify("SQL formatted");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to format SQL." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("SQL formatter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">SQL input</span>
            <button
              type="button"
              onClick={() => setValue({ ...value, input: SAMPLE_SQL, error: null })}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value, error: null })}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste SQL query"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Formatted SQL</span>
            <CopyButton value={value.output} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
        <label className="flex items-center gap-2">
          Dialect
          <select
            value={value.dialect}
            onChange={(event) => setValue({ ...value, dialect: event.target.value as SqlState["dialect"], error: null })}
            className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          >
            {DIALECTS.map((dialect) => (
              <option key={dialect.value} value={dialect.value}>
                {dialect.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Tab width
          <input
            type="number"
            min={2}
            max={8}
            value={value.tabWidth}
            onChange={(event) =>
              setValue({
                ...value,
                tabWidth: Math.min(Math.max(Number(event.target.value) || 2, 2), 8),
                error: null,
              })
            }
            className="w-16 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.uppercase}
            onChange={(event) => setValue({ ...value, uppercase: event.target.checked, error: null })}
            className="h-4 w-4 rounded border border-[var(--surface-border)]/60"
          />
          Uppercase keywords
        </label>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Format SQL
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
