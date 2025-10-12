"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface UrlEncoderState {
  input: string;
  encoded: string;
  error: string | null;
}

const SAMPLE_TEXT = "https://devtools.io/search?q=ui tooling&lang=en";

export function UrlEncoderDecoder() {
  const { value, setValue, reset } = useLocalStorage<UrlEncoderState>("tool-url-encode", {
    input: SAMPLE_TEXT,
    encoded: encodeURIComponent(SAMPLE_TEXT),
    error: null,
  });
  const { notify } = useToast();

  const decoded = useMemo(() => {
    try {
      if (!value.encoded.trim()) return "";
      return decodeURIComponent(value.encoded);
    } catch (error) {
      return "";
    }
  }, [value.encoded]);

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(value.input);
      setValue({ input: value.input, encoded, error: null });
      notify("Text encoded");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to encode text." });
    }
  };

  const handleDecode = () => {
    try {
      const decodedText = decodeURIComponent(value.encoded);
      setValue({ input: decodedText, encoded: value.encoded, error: null });
      notify("Text decoded");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to decode text." });
    }
  };

  const handleReset = () => {
    reset();
    notify("URL encoder reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Original text</span>
            <CopyButton value={value.input} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste text to encode"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Encoded text</span>
            <CopyButton value={value.encoded} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.encoded}
            onChange={(event) => setValue({ ...value, encoded: event.target.value })}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste encoded text to decode"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Decoded preview</span>
            <CopyButton value={decoded} label="Copy" variant="outline" />
          </div>
          <textarea
            value={decoded}
            readOnly
            spellCheck={false}
            className="min-h-[160px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.82)] p-5 font-mono text-sm text-[var(--foreground-muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleEncode}>
          Encode text
        </ToolButton>
        <ToolButton type="button" onClick={handleDecode} variant="secondary">
          Decode text
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
