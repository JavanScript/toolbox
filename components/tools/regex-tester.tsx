"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface RegexTesterState {
  pattern: string;
  flags: string;
  testText: string;
}

const SAMPLE_PATTERN = "(\\w+)";
const SAMPLE_FLAGS = "gi";
const SAMPLE_TEXT = `Welcome to Devtools.io!\nWe craft utilities for designers and developers.`;

function isValidFlags(flags: string) {
  return /^[gimsuy]*$/.test(flags);
}

export function RegexTester() {
  const { value, setValue, reset } = useLocalStorage<RegexTesterState>("tool-regex-tester", {
    pattern: SAMPLE_PATTERN,
    flags: SAMPLE_FLAGS,
    testText: SAMPLE_TEXT,
  });
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  const regex = useMemo(() => {
    try {
      if (!isValidFlags(value.flags)) {
        throw new Error("Flags must be any combination of g i m s u y");
      }
      setError(null);
      return new RegExp(value.pattern, value.flags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid regular expression");
      return null;
    }
  }, [value.flags, value.pattern]);

  const matches = useMemo(() => {
    if (!regex) return [];
    const results: Array<{ match: string; index: number; groups?: string[] }> = [];
    const text = value.testText;

    if (regex.global) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null = regex.exec(text);
      while (match) {
        results.push({ match: match[0], index: match.index, groups: match.slice(1) });
        match = regex.exec(text);
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        results.push({ match: match[0], index: match.index, groups: match.slice(1) });
      }
    }

    return results;
  }, [regex, value.testText]);

  const handleReset = () => {
    reset();
    setError(null);
    notify("Regex tester reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Pattern</span>
              <input
                value={value.pattern}
                onChange={(event) => setValue({ ...value, pattern: event.target.value })}
                className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="Enter regex pattern"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Flags</span>
              <input
                value={value.flags}
                onChange={(event) => setValue({ ...value, flags: event.target.value })}
                className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="e.g. g, gi, gm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Test text</span>
            <textarea
              value={value.testText}
              onChange={(event) => setValue({ ...value, testText: event.target.value })}
              spellCheck={false}
              className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste sample text to test"
            />
          </label>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Matches</p>
              <p className="text-sm text-[var(--foreground)]/80">{matches.length} found</p>
            </div>
            <CopyButton
              value={JSON.stringify(matches, null, 2)}
              label={matches.length === 0 ? "Copy" : "Copy matches"}
              variant="outline"
            />
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed">
            {matches.length === 0 ? (
              <p className="text-[var(--foreground-muted)]">No matches yet. Try adjusting your pattern or flags.</p>
            ) : (
              matches.map((match, index) => (
                <div
                  key={`${match.match}-${match.index}-${index}`}
                  className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.82)] p-4"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[var(--foreground)]">{match.match}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Index {match.index}</span>
                  </div>
                  {match.groups && match.groups.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Groups</p>
                      <ul className="space-y-1 text-[var(--foreground)]/80">
                        {match.groups.map((group, groupIndex) => (
                          <li key={`${group}-${groupIndex}`}>{group || "(empty)"}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
