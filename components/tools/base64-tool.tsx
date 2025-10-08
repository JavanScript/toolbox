"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Base64State {
  input: string;
  output: string;
  error: string | null;
}

const SAMPLE = "Hello, devtools.io";

function encode(text: string) {
  return typeof window === "undefined"
    ? Buffer.from(text, "utf-8").toString("base64")
    : window.btoa(unescape(encodeURIComponent(text)));
}

function decode(text: string) {
  return typeof window === "undefined"
    ? Buffer.from(text, "base64").toString("utf-8")
    : decodeURIComponent(escape(window.atob(text)));
}

export function Base64Tool() {
  const { value, setValue, reset } = useLocalStorage<Base64State>("tool-base64", {
    input: "",
    output: "",
    error: null,
  });
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { notify } = useToast();

  const buttonBase =
    "rounded-xl px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60";
  const primaryButton =
    `${buttonBase} bg-[var(--accent)] text-[#0b0d12] shadow-[0_20px_45px_-25px_var(--glow)] hover:bg-[#6baeff]`;
  const secondaryButton =
    `${buttonBase} border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] text-[var(--foreground)] hover:border-[var(--accent)]/50`;
  const ghostButton =
    `${buttonBase} border border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]`;

  const run = useCallback(
    (nextMode: "encode" | "decode") => {
      if (!value.input) {
        setValue({ ...value, error: "Provide some text first." });
        return;
      }
      try {
        const result = nextMode === "encode" ? encode(value.input) : decode(value.input);
        setValue({ input: value.input, output: result, error: null });
        setMode(nextMode);
  notify(nextMode === "encode" ? "Text encoded" : "Value decoded");
      } catch (error) {
        setValue({ ...value, error: error instanceof Error ? error.message : "Unable to process input." });
      }
    },
    [notify, setValue, value]
  );

  const handleSwap = useCallback(() => {
    if (!value.output) return;
    setValue({ input: value.output, output: value.input, error: null });
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    notify("Swapped input and output");
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    setMode("encode");
    notify("Base64 tool reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input</span>
            <button
              type="button"
              onClick={() => {
                setValue({ input: SAMPLE, output: value.output, error: null });
                notify("Sample text loaded");
              }}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value, error: null })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder={mode === "encode" ? "Paste raw text" : "Paste Base64 value"}
          />
          {value.error ? (
            <p className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/40 bg-[rgba(88,166,255,0.06)] px-3 py-2 text-xs text-[var(--accent)]">
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                <path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" fill="currentColor" />
              </svg>
              {value.error}
            </p>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Output</span>
            <CopyButton value={value.output} label="Copy output" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            placeholder="Output will appear here"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => run("encode")}
          className={mode === "encode" ? primaryButton : secondaryButton}
        >
          Encode text
        </button>
        <button
          type="button"
          onClick={() => run("decode")}
          className={mode === "decode" ? primaryButton : secondaryButton}
        >
          Decode Base64
        </button>
        <button type="button" onClick={handleSwap} className={secondaryButton}>
          Swap fields
        </button>
        <button type="button" onClick={handleReset} className={ghostButton}>
          Reset tool
        </button>
      </div>
    </div>
  );
}
