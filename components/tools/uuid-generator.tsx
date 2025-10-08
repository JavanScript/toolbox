"use client";

import { useCallback } from "react";
import { ulid } from "ulid";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface IdentifierEntry {
  uuid: string;
  ulid: string;
  createdAt: number;
}

interface UuidState {
  history: IdentifierEntry[];
}

function generateUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function UuidGenerator() {
  const { value, setValue, reset } = useLocalStorage<UuidState>("tool-uuid", {
    history: [
      {
        uuid: generateUuid(),
        ulid: ulid(),
        createdAt: Date.now(),
      },
    ],
  });
  const { notify } = useToast();

  const buttonBase =
    "rounded-xl px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60";
  const primaryButton =
    `${buttonBase} bg-[var(--accent)] text-[#0b0d12] shadow-[0_20px_45px_-25px_var(--glow)] hover:bg-[#6baeff]`;
  const secondaryButton =
    `${buttonBase} border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] text-[var(--foreground)] hover:border-[var(--accent)]/50`;
  const ghostButton =
    `${buttonBase} border border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]`;

  const handleGenerate = useCallback(() => {
    const entry: IdentifierEntry = {
      uuid: generateUuid(),
      ulid: ulid(),
      createdAt: Date.now(),
    };
    setValue({ history: [entry, ...value.history].slice(0, 10) });
    notify("Generated new identifiers");
  }, [notify, setValue, value.history]);

  const handleCopyAll = useCallback(async () => {
    const payload = value.history
      .map((entry) => `UUID: ${entry.uuid}\nULID: ${entry.ulid}`)
      .join("\n\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = payload;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      notify("Identifiers copied");
    } catch (error) {
      console.error(error);
      notify("Unable to copy identifiers");
    }
  }, [notify, value.history]);

  const handleReset = useCallback(() => {
    reset();
    notify("Identifier history cleared");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {value.history.map((entry, index) => (
          <div
            key={`${entry.createdAt}-${entry.uuid}`}
            className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              <span>
                {index === 0 ? "Latest identifiers" : `Generated ${new Date(entry.createdAt).toLocaleString()}`}
              </span>
              <span className="rounded-full border border-[var(--surface-border)]/60 px-3 py-1 text-[10px]">
                #{value.history.length - index}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">UUID v4</p>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)] break-all">{entry.uuid}</p>
                </div>
                <CopyButton value={entry.uuid} label="Copy" variant="ghost" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">ULID</p>
                  <p className="mt-1 font-mono text-sm text-[var(--foreground)] break-all">{entry.ulid}</p>
                </div>
                <CopyButton value={entry.ulid} label="Copy" variant="ghost" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={handleGenerate} className={primaryButton}>
          Generate new set
        </button>
        <button type="button" onClick={handleCopyAll} className={secondaryButton}>
          Copy latest 10
        </button>
        <button type="button" onClick={handleReset} className={ghostButton}>
          Clear history
        </button>
      </div>
    </div>
  );
}
