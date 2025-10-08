"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface MetaState {
  siteName: string;
  title: string;
  description: string;
  url: string;
  image: string;
  themeColor: string;
  twitter: string;
  html: string;
  error: string | null;
}

function buildMeta(state: Omit<MetaState, "html" | "error">) {
  const lines = [
    `<!-- Primary Meta Tags -->`,
    `<title>${state.title}</title>`,
    `<meta name="title" content="${state.title}" />`,
    `<meta name="description" content="${state.description}" />`,
    ``,
    `<!-- Open Graph / Facebook -->`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${state.url}" />`,
    `<meta property="og:site_name" content="${state.siteName}" />`,
    `<meta property="og:title" content="${state.title}" />`,
    `<meta property="og:description" content="${state.description}" />`,
    `<meta property="og:image" content="${state.image}" />`,
    ``,
    `<!-- Twitter -->`,
    `<meta property="twitter:card" content="summary_large_image" />`,
    `<meta property="twitter:url" content="${state.url}" />`,
    `<meta property="twitter:title" content="${state.title}" />`,
    `<meta property="twitter:description" content="${state.description}" />`,
    `<meta property="twitter:image" content="${state.image}" />`,
  ];

  if (state.twitter) {
    lines.push(`<meta property="twitter:site" content="${state.twitter}" />`);
    lines.push(`<meta property="twitter:creator" content="${state.twitter}" />`);
  }

  if (state.themeColor) {
    lines.unshift(`<meta name="theme-color" content="${state.themeColor}" />`);
  }

  return lines.join("\n");
}

const INITIAL_STATE: MetaState = {
  siteName: "devtools.io",
  title: "devtools.io — Frictionless developer utilities",
  description:
    "50+ beautiful, privacy-first web utilities that feel like your favorite native app. No tracking, instant performance, crafted for developers.",
  url: "https://devtools.io",
  image: "https://devtools.io/og-image.png",
  themeColor: "#0B0D12",
  twitter: "@devtools",
  html: "",
  error: null,
};

export function MetaTagsGenerator() {
  const { value, setValue, reset } = useLocalStorage<MetaState>("tool-meta-tags", {
    ...INITIAL_STATE,
    html: buildMeta(INITIAL_STATE),
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      if (!value.title.trim() || !value.description.trim()) {
        throw new Error("Title and description are required.");
      }
      if (!value.url.startsWith("http")) {
        throw new Error("Enter a full URL including protocol.");
      }
      const html = buildMeta(value);
      setValue({ ...value, html, error: null });
      notify("Meta tags generated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to build meta tags." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Meta tags reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          {[{
            key: "siteName",
            label: "Site name",
            placeholder: "devtools.io",
          }, {
            key: "title",
            label: "Title",
            placeholder: "devtools.io — Frictionless developer utilities",
          }, {
            key: "description",
            label: "Description",
            multiline: true,
            placeholder: "50+ beautiful, privacy-first web utilities...",
          }, {
            key: "url",
            label: "Canonical URL",
            placeholder: "https://devtools.io",
          }, {
            key: "image",
            label: "Preview image URL",
            placeholder: "https://devtools.io/og-image.png",
          }, {
            key: "themeColor",
            label: "Theme color",
            type: "color",
          }, {
            key: "twitter",
            label: "Twitter @handle",
            placeholder: "@devtools",
          }].map((field) => (
            <label
              key={field.key}
              className="flex flex-col gap-2 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]"
            >
              {field.label}
              {field.multiline ? (
                <textarea
                  value={value[field.key as keyof MetaState] as string}
                  onChange={(event) => setValue({ ...value, [field.key]: event.target.value, error: null })}
                  className="min-h-[120px] w-full resize-y rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] p-4 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                  placeholder={field.placeholder}
                  maxLength={160}
                />
              ) : field.type === "color" ? (
                <input
                  type="color"
                  value={value.themeColor}
                  onChange={(event) => setValue({ ...value, themeColor: event.target.value, error: null })}
                  className="h-12 w-24 cursor-pointer rounded-2xl border border-[var(--surface-border)]/60"
                />
              ) : (
                <input
                  value={value[field.key as keyof MetaState] as string}
                  onChange={(event) => setValue({ ...value, [field.key]: event.target.value, error: null })}
                  className="w-full rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
          <div className="flex gap-3">
            <ToolButton
              type="button"
              onClick={() => {
                const preset = { ...INITIAL_STATE };
                setValue({ ...preset, html: buildMeta(preset), error: null });
                notify("Loaded devtools preset");
              }}
              variant="secondary"
            >
              Load sample preset
            </ToolButton>
            <ToolButton type="button" onClick={handleReset} variant="ghost">
              Reset
            </ToolButton>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Meta tags</span>
              <CopyButton value={value.html} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.html}
              readOnly
              spellCheck={false}
              className="mt-3 min-h-[260px] w-full resize-y rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Preview</p>
            <div className="mt-4 space-y-2 rounded-2xl border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.9)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">{value.title}</p>
              <p className="text-xs text-[var(--foreground-muted)]">{value.url}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{value.description}</p>
            </div>
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Generate meta tags
        </ToolButton>
      </div>
    </div>
  );
}
