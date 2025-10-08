"use client";

import { useCallback, useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface PasswordState {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidAmbiguous: boolean;
  password: string;
  history: string[];
  error: string | null;
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?";
const AMBIGUOUS = new Set(["l", "1", "I", "O", "0", "o", "{", "}", "[", "]", "(", ")", "/", "\\"]);

function randomIndex(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function generatePassword(state: PasswordState) {
  const pools: string[] = [];
  if (state.includeLowercase) pools.push(LOWERCASE);
  if (state.includeUppercase) pools.push(UPPERCASE);
  if (state.includeNumbers) pools.push(NUMBERS);
  if (state.includeSymbols) pools.push(SYMBOLS);

  if (pools.length === 0) {
    throw new Error("Select at least one character set.");
  }

  const requiredChars = pools.map((pool) => pool[randomIndex(pool.length)]);
  const allChars = pools
    .join("")
    .split("")
    .filter((char) => !state.avoidAmbiguous || !AMBIGUOUS.has(char));

  if (allChars.length === 0) {
    throw new Error("Character pool is empty with current settings.");
  }

  const passwordChars: string[] = [];
  for (let index = 0; index < state.length; index += 1) {
    if (index < requiredChars.length) {
      passwordChars.push(requiredChars[index]);
      continue;
    }
    const char = allChars[randomIndex(allChars.length)];
    passwordChars.push(char);
  }

  // Shuffle password for better distribution
  for (let index = passwordChars.length - 1; index > 0; index -= 1) {
    const j = randomIndex(index + 1);
    [passwordChars[index], passwordChars[j]] = [passwordChars[j], passwordChars[index]];
  }

  return passwordChars.join("");
}

function evaluateStrength(state: PasswordState) {
  let score = 0;
  if (state.length >= 12) score += 1;
  if (state.length >= 16) score += 1;
  const sets = [state.includeLowercase, state.includeUppercase, state.includeNumbers, state.includeSymbols].filter(Boolean).length;
  score += Math.max(0, sets - 1);
  if (state.avoidAmbiguous) score += 0.5;

  if (score >= 4) return { label: "Excellent", color: "bg-emerald-500" };
  if (score >= 3) return { label: "Strong", color: "bg-lime-500" };
  if (score >= 2) return { label: "Okay", color: "bg-amber-400" };
  return { label: "Weak", color: "bg-rose-500" };
}

const INITIAL_STATE: PasswordState = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  avoidAmbiguous: true,
  password: "",
  history: [],
  error: null,
};

const DEFAULT_STATE: PasswordState = (() => {
  const base = { ...INITIAL_STATE };
  const password = generatePassword(base);
  return {
    ...base,
    password,
    history: [password],
  };
})();

export function PasswordGenerator() {
  const { value, setValue, reset } = useLocalStorage<PasswordState>("tool-password", DEFAULT_STATE);
  const { notify } = useToast();

  const strength = useMemo(() => evaluateStrength(value), [value]);

  const run = useCallback(() => {
    try {
      if (value.length < 6 || value.length > 64) {
        throw new Error("Length must be between 6 and 64 characters.");
      }
      const password = generatePassword(value);
      setValue({
        ...value,
        password,
        history: [password, ...value.history].slice(0, 8),
        error: null,
      });
      notify("Password generated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to generate password." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Password generator reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Generated password</p>
            <p className="mt-3 break-all font-mono text-lg text-[var(--foreground)]">{value.password || "—"}</p>
          </div>
          <CopyButton value={value.password} label="Copy" variant="outline" />
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
          <span>Strength</span>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[var(--foreground)] ${strength.color}`}>
            • {strength.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="flex flex-col gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              <span>Password length</span>
              <span className="font-mono text-sm text-[var(--foreground)]">{value.length}</span>
            </div>
            <input
              type="range"
              min={6}
              max={64}
              value={value.length}
              onChange={(event) => setValue({ ...value, length: Number(event.target.value), error: null })}
              className="w-full"
            />
          </label>

          {([
            {
              key: "includeLowercase",
              label: "Include lowercase",
              description: "abc",
            },
            {
              key: "includeUppercase",
              label: "Include uppercase",
              description: "ABC",
            },
            {
              key: "includeNumbers",
              label: "Include numbers",
              description: "012",
            },
            {
              key: "includeSymbols",
              label: "Include symbols",
              description: "!@#",
            },
            {
              key: "avoidAmbiguous",
              label: "Avoid ambiguous",
              description: "Exclude l/1/O/0",
            },
          ] as Array<{
            key: "includeLowercase" | "includeUppercase" | "includeNumbers" | "includeSymbols" | "avoidAmbiguous";
            label: string;
            description: string;
          }>).map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground)]"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                {option.label}
                <span className="ml-2 text-[10px] text-[var(--foreground-muted)]">{option.description}</span>
              </span>
              <input
                type="checkbox"
                checked={value[option.key]}
                onChange={(event) =>
                  setValue({
                    ...value,
                    [option.key]: event.target.checked,
                    error: null,
                  })
                }
                className="h-5 w-9 cursor-pointer appearance-none rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] transition before:inline-block before:h-4 before:w-4 before:-translate-x-3 before:rounded-full before:bg-[var(--foreground-muted)] before:transition checked:bg-[var(--accent)] checked:before:translate-x-3 checked:before:bg-[#0b0d12]"
              />
            </label>
          ))}

          <button
            type="button"
            onClick={() => {
              setValue({
                length: 24,
                includeLowercase: true,
                includeUppercase: true,
                includeNumbers: true,
                includeSymbols: true,
                avoidAmbiguous: false,
                password: value.password,
                history: value.history,
                error: null,
              });
              notify("Preset loaded");
            }}
            className="text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load high-entropy preset
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">History</p>
            {value.history.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">Generate passwords to build history.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {value.history.map((entry, index) => (
                  <li key={`${entry}-${index}`} className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.78)] px-4 py-3 font-mono text-sm text-[var(--foreground)]">
                    <span className="break-all">{entry}</span>
                    <CopyButton value={entry} label="Copy" variant="ghost" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Generate password
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
