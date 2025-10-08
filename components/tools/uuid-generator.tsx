"use client";

import { useCallback } from "react";
import { ulid } from "ulid";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { copyText } from "@/lib/clipboard";
import { ToolButton } from "@/components/tools/tool-ui";

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
      await copyText(payload);
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
        <ToolButton type="button" onClick={handleGenerate}>
          Generate new set
        </ToolButton>
        <ToolButton type="button" onClick={handleCopyAll} variant="secondary">
          Copy latest 10
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Clear history
        </ToolButton>
      </div>
    </div>
  );
}
