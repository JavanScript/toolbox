"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Base64ToImageState {
  input: string;
  filename: string;
  mime: string;
}

const SAMPLE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

const DEFAULT_STATE: Base64ToImageState = {
  input: SAMPLE_BASE64,
  filename: "image.png",
  mime: "image/png",
};

function sanitize(value: string) {
  return value.replace(/\s+/g, "");
}

function hasDataUrlPrefix(value: string) {
  return value.trim().startsWith("data:");
}

export function Base64ToImage() {
  const { value, setValue, reset } = useLocalStorage<Base64ToImageState>("tool-base64-to-image", DEFAULT_STATE);
  const { notify } = useToast();

  const decoded = useMemo(() => {
    const raw = value.input.trim();
    if (!raw) {
      return { dataUrl: null, size: 0, error: null } as const;
    }

    const candidate = hasDataUrlPrefix(raw) ? raw : `data:${value.mime || "image/png"};base64,${sanitize(raw)}`;

    try {
      const base64Part = hasDataUrlPrefix(candidate) ? candidate.split(",")[1] ?? "" : candidate;
      if (typeof window !== "undefined") {
        window.atob(base64Part);
      }
      const byteLength = Math.floor((base64Part.length * 3) / 4 - (base64Part.endsWith("==") ? 2 : base64Part.endsWith("=") ? 1 : 0));
      return { dataUrl: candidate, size: byteLength, error: null } as const;
    } catch (cause) {
      console.warn("Invalid base64 string", cause);
      return { dataUrl: null, size: 0, error: "Input is not valid Base64" } as const;
    }
  }, [value.input, value.mime]);

  const handleReset = () => {
    reset();
    notify("Base64 to Image reset");
  };

  const sizeLabel = decoded.size === 0 ? "--" : decoded.size < 1024 ? `${decoded.size} B` : `${(decoded.size / 1024).toFixed(1)} KB`;
  const error = decoded.error;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Base64 input</span>
              <CopyButton value={value.input} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.input}
              onChange={(event) => setValue({ ...value, input: event.target.value })}
              spellCheck={false}
              className="min-h-[280px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste Base64 or data URL"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Filename</span>
              <input
                value={value.filename}
                onChange={(event) => setValue({ ...value, filename: event.target.value })}
                className="w-full rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              />
            </label>
            <label className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">MIME type</span>
              <input
                value={value.mime}
                onChange={(event) => setValue({ ...value, mime: event.target.value })}
                className="w-full rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="image/png"
              />
            </label>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Preview</p>
            {decoded.dataUrl ? <CopyButton value={decoded.dataUrl} label="Copy data URL" variant="outline" /> : null}
          </div>

          {error ? <ToolError message={error} /> : null}

          {decoded.dataUrl ? (
            <div className="space-y-3 text-sm text-[var(--foreground)]">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4">
                <img
                  src={decoded.dataUrl}
                  alt={value.filename || "Decoded preview"}
                  className="max-h-64 w-auto rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.6)]"
                />
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                  <span>{value.mime}</span>
                  <span>&middot;</span>
                  <span>{sizeLabel}</span>
                </div>
                <a
                  href={decoded.dataUrl}
                  download={value.filename || "image"}
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--accent)]/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--accent)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Download image
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.7)] p-4 text-sm text-[var(--foreground-muted)]">
              Valid Base64 will render here
            </div>
          )}
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
