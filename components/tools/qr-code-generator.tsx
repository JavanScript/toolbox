"use client";

import { useCallback } from "react";
import QRCode from "qrcode";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface QrState {
  text: string;
  size: number;
  margin: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  foreground: string;
  background: string;
  png: string;
  svg: string;
  error: string | null;
}

const SAMPLE_TEXT = "https://devtools.io";

async function generateQr(state: QrState) {
  const options = {
    errorCorrectionLevel: state.errorCorrection,
    margin: state.margin,
    color: {
      dark: state.foreground,
      light: state.background,
    },
    width: state.size,
  } as const;

  const [png, svg] = await Promise.all([
    QRCode.toDataURL(state.text, options),
    QRCode.toString(state.text, { ...options, type: "svg" }),
  ]);

  return { png, svg };
}

const INITIAL_STATE: QrState = {
  text: SAMPLE_TEXT,
  size: 240,
  margin: 2,
  errorCorrection: "M",
  foreground: "#0B0D12",
  background: "#FFFFFF",
  png: "",
  svg: "",
  error: null,
};

export function QrCodeGenerator() {
  const { value, setValue, reset } = useLocalStorage<QrState>("tool-qr", INITIAL_STATE);
  const { notify } = useToast();

  const run = useCallback(async () => {
    try {
      if (!value.text.trim()) {
        throw new Error("Enter text or a URL to encode.");
      }
      const { png, svg } = await generateQr(value);
      setValue({ ...value, png, svg, error: null });
      notify("QR code generated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to generate QR code." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("QR code generator reset");
  }, [notify, reset]);

  const handleDownload = useCallback(
    (type: "png" | "svg") => {
      const data = type === "png" ? value.png : value.svg;
      if (!data) {
        setValue({ ...value, error: "Generate a QR code first." });
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = type === "png" ? data : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
      anchor.download = type === "png" ? "qr-code.png" : "qr-code.svg";
      anchor.click();
    },
    [setValue, value]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Text / URL</span>
              <button
                type="button"
                onClick={() => setValue({ ...value, text: SAMPLE_TEXT, error: null })}
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
              >
                Load sample
              </button>
            </div>
            <textarea
              value={value.text}
              onChange={(event) => setValue({ ...value, text: event.target.value, error: null })}
              className="min-h-[150px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste text to encode"
            />
          </div>
          <label className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            Size {value.size}px
            <input
              type="range"
              min={120}
              max={480}
              step={10}
              value={value.size}
              onChange={(event) => setValue({ ...value, size: Number(event.target.value), error: null })}
            />
          </label>
          <label className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            Margin {value.margin}
            <input
              type="range"
              min={0}
              max={8}
              value={value.margin}
              onChange={(event) => setValue({ ...value, margin: Number(event.target.value), error: null })}
            />
          </label>
          <label className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            Error correction
            <select
              value={value.errorCorrection}
              onChange={(event) =>
                setValue({ ...value, errorCorrection: event.target.value as QrState["errorCorrection"], error: null })
              }
              className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            >
              <option value="L">Low (L)</option>
              <option value="M">Medium (M)</option>
              <option value="Q">Quartile (Q)</option>
              <option value="H">High (H)</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Foreground
              <input
                type="color"
                value={value.foreground.replace("0x", "#")}
                onChange={(event) => setValue({ ...value, foreground: event.target.value, error: null })}
                className="h-12 w-full cursor-pointer rounded-2xl border border-[var(--surface-border)]/60"
              />
            </label>
            <label className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Background
              <input
                type="color"
                value={value.background.replace("0x", "#")}
                onChange={(event) => setValue({ ...value, background: event.target.value, error: null })}
                className="h-12 w-full cursor-pointer rounded-2xl border border-[var(--surface-border)]/60"
              />
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-6">
            <div
              className="flex h-[280px] w-[280px] items-center justify-center rounded-3xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.9)]"
            >
              {value.png ? (
                <img src={value.png} alt="Generated QR code" className="h-[240px] w-[240px]" />
              ) : (
                <p className="text-sm text-[var(--foreground-muted)]">Generate to preview</p>
              )}
            </div>
            <div className="flex gap-3">
              <ToolButton type="button" onClick={() => handleDownload("png")} variant="secondary">
                Download PNG
              </ToolButton>
              <ToolButton type="button" onClick={() => handleDownload("svg")} variant="secondary">
                Download SVG
              </ToolButton>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">SVG markup</span>
              <CopyButton value={value.svg} label="Copy SVG" variant="outline" />
            </div>
            <textarea
              value={value.svg}
              readOnly
              spellCheck={false}
              className="min-h-[180px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Generate QR code
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
