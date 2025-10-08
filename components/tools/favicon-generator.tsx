"use client";

import { useCallback, useRef, type ChangeEvent } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface GeneratedIcon {
  size: number;
  dataUrl: string;
}

interface FaviconState {
  fileName: string | null;
  source: string | null;
  icons: GeneratedIcon[];
  html: string;
  error: string | null;
}

const SIZES = [16, 32, 48, 64, 180];

function buildHtmlSnippet(icons: GeneratedIcon[]) {
  return icons
    .map((icon) => `<link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="/favicons/favicon-${icon.size}.png" />`)
    .concat(
      icons.some((icon) => icon.size >= 180)
        ? '<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />'
        : []
    )
    .join("\n");
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = source;
  });
}

async function generateIcons(source: string) {
  const image = await loadImage(source);
  const icons: GeneratedIcon[] = [];

  for (const size of SIZES) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas not supported in this browser.");
    }

    context.clearRect(0, 0, size, size);

    const scale = Math.max(size / image.width, size / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = (size - drawWidth) / 2;
    const offsetY = (size - drawHeight) / 2;

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    const dataUrl = canvas.toDataURL("image/png");
    icons.push({ size, dataUrl });
  }

  return icons;
}

function createSampleArtwork(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return canvas.toDataURL("image/png");

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#3A1C71");
  gradient.addColorStop(0.5, "#D76D77");
  gradient.addColorStop(1, "#FFAF7B");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.fillStyle = "rgba(11, 13, 18, 0.75)";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.28, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.font = `${size * 0.38}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("d·", size / 2, size / 2 + size * 0.04);

  return canvas.toDataURL("image/png");
}

async function generateSampleIcons() {
  return SIZES.map((size) => ({ size, dataUrl: createSampleArtwork(size) }));
}

const INITIAL_STATE: FaviconState = {
  fileName: null,
  source: null,
  icons: [],
  html: buildHtmlSnippet([]),
  error: null,
};

export function FaviconGenerator() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { value, setValue, reset } = useLocalStorage<FaviconState>("tool-favicon", INITIAL_STATE);
  const { notify } = useToast();

  const runGeneration = useCallback(
    async (source: string, fileName: string | null) => {
      try {
        const icons = await generateIcons(source);
        setValue({
          fileName,
          source,
          icons,
          html: buildHtmlSnippet(icons),
          error: null,
        });
        notify("Favicons generated");
      } catch (error) {
        setValue({ ...value, error: error instanceof Error ? error.message : "Unable to generate favicons." });
      }
    },
    [notify, setValue, value]
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setValue({ ...value, error: "Please upload an image file." });
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          await runGeneration(reader.result, file.name);
        }
      };
      reader.onerror = () => {
        setValue({ ...value, error: "Unable to read the image file." });
      };
      reader.readAsDataURL(file);
    },
    [runGeneration, setValue, value]
  );

  const handleDownload = useCallback((icon: GeneratedIcon) => {
    const anchor = document.createElement("a");
    anchor.href = icon.dataUrl;
    anchor.download = `favicon-${icon.size}.png`;
    anchor.click();
  }, []);

  const handleSample = useCallback(async () => {
    const icons = await generateSampleIcons();
    const sampleSource = createSampleArtwork(256);
    setValue({
      fileName: "devtools-sample.png",
      source: sampleSource,
      icons,
      html: buildHtmlSnippet(icons),
      error: null,
    });
    notify("Sample favicon generated");
  }, [notify, setValue]);

  const handleReset = useCallback(() => {
    reset();
    fileInputRef.current?.value && (fileInputRef.current.value = "");
    notify("Favicon tool reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Upload image</p>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              PNG or SVG images work best. We'll generate a set of favicons optimized for common platforms.
            </p>
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="w-full text-sm text-[var(--foreground-muted)]"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ToolButton type="button" onClick={handleSample} variant="secondary">
                Load sample artwork
              </ToolButton>
              <ToolButton type="button" onClick={handleReset} variant="ghost">
                Reset
              </ToolButton>
            </div>
          </div>
          {value.source ? (
            <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Source preview</p>
              <div className="mt-4 flex items-center justify-center rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.9)] p-4">
                <img
                  src={value.source}
                  alt="Source artwork"
                  className="max-h-40 max-w-full rounded-2xl object-contain"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">{value.fileName}</p>
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {value.icons.map((icon) => (
              <div
                key={icon.size}
                className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
                  {icon.size}×{icon.size}
                </span>
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.9)]">
                  <img src={icon.dataUrl} alt={`${icon.size}px favicon`} className="h-16 w-16 object-contain" />
                </div>
                <ToolButton type="button" onClick={() => handleDownload(icon)} variant="secondary">
                  Download PNG
                </ToolButton>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">HTML snippet</span>
              <CopyButton value={value.html} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.html}
              readOnly
              spellCheck={false}
              className="min-h-[180px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={async () => {
            if (!value.source) {
              setValue({ ...value, error: "Upload or load an image first." });
              return;
            }
            await runGeneration(value.source, value.fileName);
          }}
        >
          Regenerate variants
        </ToolButton>
      </div>
    </div>
  );
}
