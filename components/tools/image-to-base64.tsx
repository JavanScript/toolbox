"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ImageToBase64State {
  includePrefix: boolean;
  wrapOutput: boolean;
  wrapWidth: number;
}

interface FileDetails {
  name: string;
  type: string;
  size: number;
  dimensions?: { width: number; height: number };
}

const DEFAULT_STATE: ImageToBase64State = {
  includePrefix: true,
  wrapOutput: false,
  wrapWidth: 76,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function wrapText(value: string, width: number) {
  if (width <= 0) return value;
  const regex = new RegExp(`.{1,${width}}`, "g");
  const chunks = value.match(regex);
  if (!chunks) return value;
  return chunks.join("\n");
}

export function ImageToBase64() {
  const { value, setValue, reset } = useLocalStorage<ImageToBase64State>("tool-image-to-base64", DEFAULT_STATE);
  const { notify } = useToast();

  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rawBase64, setRawBase64] = useState<string>("");
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formattedOutput = useMemo(() => {
    if (!dataUrl) return "";
    const raw = rawBase64;
    if (value.includePrefix) {
      return value.wrapOutput ? wrapText(dataUrl, value.wrapWidth) : dataUrl;
    }
    return value.wrapOutput ? wrapText(raw, value.wrapWidth) : raw;
  }, [dataUrl, rawBase64, value.includePrefix, value.wrapOutput, value.wrapWidth]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          setError("Failed to read file contents");
          return;
        }
        const base64 = result.split(",")[1] ?? "";
        setDataUrl(result);
        setRawBase64(base64);
        setError(null);

        const image = new Image();
        image.onload = () => {
          setFileDetails({
            name: file.name,
            type: file.type || "Unknown",
            size: file.size,
            dimensions: { width: image.width, height: image.height },
          });
        };
        image.src = result;
        notify("Image encoded to Base64");
      };
      reader.onerror = () => {
        setError("Failed to read file contents");
      };
      reader.readAsDataURL(file);
    },
    [notify]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    reset();
    setDataUrl(null);
    setRawBase64("");
    setFileDetails(null);
    setError(null);
    notify("Image to Base64 reset");
  };

  const outputLabel = value.includePrefix ? "Data URL" : "Base64";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <label
            htmlFor="image-to-base64-input"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-[var(--accent)]/80 bg-[rgba(88,166,255,0.12)]"
                : "border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] hover:border-[var(--accent)]/60"
            }`}
          >
            <input id="image-to-base64-input" type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Drop image or click to upload</span>
            <p className="mt-4 max-w-sm text-sm text-[var(--foreground-muted)]">
              Supports PNG, JPEG, GIF, SVG, and more. File stays on device.
            </p>
          </label>

          {fileDetails ? (
            <div className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">File info</span>
                <CopyButton value={fileDetails.name} label="Copy name" variant="outline" />
              </div>
              <ul className="space-y-1 text-[13px]">
                <li><span className="text-[var(--foreground-muted)]">Name:</span> {fileDetails.name}</li>
                <li><span className="text-[var(--foreground-muted)]">Type:</span> {fileDetails.type}</li>
                <li><span className="text-[var(--foreground-muted)]">Size:</span> {formatSize(fileDetails.size)}</li>
                {fileDetails.dimensions ? (
                  <li>
                    <span className="text-[var(--foreground-muted)]">Dimensions:</span> {fileDetails.dimensions.width} × {fileDetails.dimensions.height}
                  </li>
                ) : null}
              </ul>
              {dataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={dataUrl}
                    alt={fileDetails.name}
                    className="max-h-48 w-auto rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(8,10,16,0.6)]"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Options</p>
            <div className="space-y-3 text-sm text-[var(--foreground)]">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Include data URL prefix</span>
                <input
                  type="checkbox"
                  checked={value.includePrefix}
                  onChange={(event) => setValue({ ...value, includePrefix: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <span>Wrap output</span>
                <input
                  type="checkbox"
                  checked={value.wrapOutput}
                  onChange={(event) => setValue({ ...value, wrapOutput: event.target.checked })}
                  className="h-4 w-4 rounded border-[var(--surface-border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
              </label>

              <label className="flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Wrap width</span>
                  <span className="text-[var(--foreground-muted)]">{value.wrapWidth} characters</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={160}
                  step={4}
                  value={value.wrapWidth}
                  onChange={(event) => setValue({ ...value, wrapWidth: Number(event.target.value) })}
                  className="w-full accent-[var(--accent)]"
                  disabled={!value.wrapOutput}
                />
              </label>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{outputLabel}</p>
            {formattedOutput ? <CopyButton value={formattedOutput} label={`Copy ${outputLabel.toLowerCase()}`} variant="outline" /> : null}
          </div>

          {error ? <ToolError message={error} /> : null}

          <textarea
            value={formattedOutput}
            readOnly
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Encoded string will appear here"
          />
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
