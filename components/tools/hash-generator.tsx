"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

type HashAlgorithm = (typeof ALGORITHMS)[number];

interface HashGeneratorState {
  text: string;
  algorithm: HashAlgorithm;
  hash: string;
  error: string | null;
}

const SAMPLE_TEXT = "Devtools.io";

async function computeHash(text: string, algorithm: HashAlgorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function HashGenerator() {
  const { value, setValue } = useLocalStorage<HashGeneratorState>("tool-hash-generator", {
    text: SAMPLE_TEXT,
    algorithm: "SHA-256",
    hash: "",
    error: null,
  });
  const { notify } = useToast();
  const [isComputing, setIsComputing] = useState(false);

  const canUseCrypto = useMemo(() => typeof window !== "undefined" && !!window.crypto?.subtle, []);

  useEffect(() => {
    if (!canUseCrypto) {
      setValue({ ...value, error: "Web Crypto API is not available in this environment." });
    }
  }, [canUseCrypto, setValue, value]);

  const runHash = async (text: string, algorithm: HashAlgorithm) => {
    if (!canUseCrypto) return;
    try {
      setIsComputing(true);
      const hash = await computeHash(text, algorithm);
      setValue({ text, algorithm, hash, error: null });
      notify(`${algorithm} hash generated`);
    } catch (error) {
      setValue({ text, algorithm, hash: "", error: error instanceof Error ? error.message : "Failed to generate hash." });
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    if (!value.hash && value.text) {
      void runHash(value.text, value.algorithm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input text</span>
            <textarea
              value={value.text}
              onChange={(event) => setValue({ ...value, text: event.target.value })}
              spellCheck={false}
              className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste text to hash"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Algorithm</span>
            <select
              value={value.algorithm}
              onChange={(event) => setValue({ ...value, algorithm: event.target.value as HashAlgorithm })}
              className="w-full appearance-none rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            >
              {ALGORITHMS.map((algorithm) => (
                <option key={algorithm} value={algorithm}>
                  {algorithm}
                </option>
              ))}
            </select>
          </label>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Hash output</p>
            <CopyButton value={value.hash} label={value.hash ? "Copy hash" : "Copy"} variant="outline" />
          </div>
          <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.82)] p-4 font-mono text-sm text-[var(--foreground)]">
            {value.hash || <span className="text-[var(--foreground-muted)]">Hash will appear here</span>}
          </div>
        </aside>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={() => void runHash(value.text, value.algorithm)} disabled={isComputing || !value.text}>
          {isComputing ? "Generating…" : "Generate hash"}
        </ToolButton>
      </div>
    </div>
  );
}
