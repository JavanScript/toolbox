"use client";

import { useEffect, useMemo } from "react";
import UAParser from "ua-parser-js";
import type { IResult } from "ua-parser-js";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface UserAgentState {
  input: string;
}

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function formatEntry(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ") || "--";
}

function isLikelyBot(ua: string) {
  return /(bot|crawler|spider|archiver|mediapartners|slurp|bingpreview)/i.test(ua);
}

export function UserAgentParserTool() {
  const { value, setValue, reset } = useLocalStorage<UserAgentState>("tool-user-agent-parser", {
    input: DEFAULT_UA,
  });
  const { notify } = useToast();

  useEffect(() => {
    if (!value.input && typeof navigator !== "undefined") {
      setValue({ input: navigator.userAgent });
    }
  }, [setValue, value.input]);

  const parsed = useMemo(() => {
    const ua = value.input.trim();
    if (!ua) {
      return { error: null, data: null as IResult | null } as const;
    }

    try {
      const parser = new UAParser(ua);
      const result = parser.getResult();
      return { error: null, data: result } as const;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to parse user agent", data: null } as const;
    }
  }, [value.input]);

  const summary = useMemo(() => {
    if (!parsed.data) {
      return [] as Array<{ label: string; value: string }>;
    }
    const data = parsed.data;
    return [
      { label: "Browser", value: formatEntry(data.browser.name, data.browser.version) },
      { label: "Engine", value: formatEntry(data.engine.name, data.engine.version) },
      { label: "OS", value: formatEntry(data.os.name, data.os.version) },
      { label: "Device", value: formatEntry(data.device.vendor, data.device.model, data.device.type) },
      { label: "CPU", value: formatEntry(data.cpu.architecture) },
    ];
  }, [parsed.data]);

  const detailJson = parsed.data ? JSON.stringify(parsed.data, null, 2) : "";

  const extraSignals = useMemo(() => {
    if (!parsed.data) return [] as Array<{ label: string; value: string; tone: "positive" | "warn" | "neutral" }>;
    const uaString = value.input;
    const signals: Array<{ label: string; value: string; tone: "positive" | "warn" | "neutral" }> = [];

    if (isLikelyBot(uaString)) {
      signals.push({ label: "Automation", value: "Likely bot or crawler", tone: "warn" });
    } else {
      signals.push({ label: "Automation", value: "Typical browser traffic", tone: "positive" });
    }

    const platform = parsed.data.os.name?.toLowerCase() ?? "";
    if (platform.includes("windows") || platform.includes("mac")) {
      signals.push({ label: "Platform", value: "Desktop-class device", tone: "neutral" });
    } else if (parsed.data.device.type) {
      signals.push({ label: "Platform", value: `Detected ${parsed.data.device.type}`, tone: "neutral" });
    }

    if (parsed.data.browser.name) {
      const version = parsed.data.browser.version ? parseInt(parsed.data.browser.version, 10) : null;
      if (parsed.data.browser.name === "Internet Explorer") {
        signals.push({ label: "Browser", value: "Legacy IE detected", tone: "warn" });
      } else if (parsed.data.browser.name === "Chrome" && version && version < 100) {
        signals.push({ label: "Browser", value: "Older Chrome build", tone: "warn" });
      } else {
        signals.push({ label: "Browser", value: `${parsed.data.browser.name} ${parsed.data.browser.version ?? ""}`.trim(), tone: "positive" });
      }
    }

    return signals;
  }, [parsed.data, value.input]);

  const handleUseCurrent = () => {
    if (typeof navigator !== "undefined") {
      setValue({ input: navigator.userAgent });
      notify("Captured current user agent");
    } else {
      notify("Navigator API not available");
    }
  };

  const handleReset = () => {
    reset();
    notify("User agent parser reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">User agent string</span>
            <CopyButton value={value.input} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste or type a user agent string"
          />

          <div className="flex flex-wrap items-center gap-3">
            <ToolButton type="button" onClick={handleUseCurrent} variant="secondary">
              Use my browser&apos;s UA
            </ToolButton>
            <ToolButton type="button" onClick={handleReset} variant="ghost">
              Reset
            </ToolButton>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Summary</p>
            {detailJson ? <CopyButton value={detailJson} label="Copy JSON" variant="outline" /> : null}
          </div>

          {parsed.error ? <ToolError message={parsed.error} /> : null}

          <div className="space-y-3 text-sm text-[var(--foreground)]">
            <div className="grid gap-3 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              {summary.length > 0 ? (
                summary.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1 text-[var(--foreground)]">
                    <span className="text-[var(--foreground-muted)]">{item.label}</span>
                    <span className="font-mono text-[13px] text-[var(--foreground)]">{item.value}</span>
                  </div>
                ))
              ) : (
                <span>No parsed details yet</span>
              )}
            </div>

            {extraSignals.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Signals</p>
                {extraSignals.map((signal) => (
                  <div
                    key={`${signal.label}-${signal.value}`}
                    className={`rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em] ${
                      signal.tone === "positive"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : signal.tone === "warn"
                        ? "border-red-500/40 bg-red-500/10 text-red-200"
                        : "border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.72)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    <span className="block text-[var(--foreground)]">{signal.label}</span>
                    <span className="mt-2 block text-[var(--foreground-muted)] normal-case">{signal.value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Raw UA</p>
              <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs text-[var(--foreground)]">
                <pre className="whitespace-pre-wrap break-words font-mono">{value.input || "(empty)"}</pre>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
