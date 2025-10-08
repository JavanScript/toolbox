"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { copyText } from "@/lib/clipboard";
import { ToolButton } from "@/components/tools/tool-ui";

interface CaseState {
  input: string;
}

function tokenize(text: string) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-\.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function camelCase(words: string[]) {
  if (words.length === 0) return "";
  const [first, ...rest] = words;
  return first.toLowerCase() + rest.map(capitalize).join("");
}

function pascalCase(words: string[]) {
  return words.map(capitalize).join("");
}

function snakeCase(words: string[]) {
  return words.map((word) => word.toLowerCase()).join("_");
}

function kebabCase(words: string[]) {
  return words.map((word) => word.toLowerCase()).join("-");
}

function titleCase(words: string[]) {
  return words.map(capitalize).join(" ");
}

function sentenceCase(text: string) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function CaseConverter() {
  const { value, setValue, reset } = useLocalStorage<CaseState>("tool-case", {
    input: "Frictionless utility for developers",
  });
  const { notify } = useToast();

  const words = useMemo(() => tokenize(value.input), [value.input]);

  const outputs = useMemo(
    () => [
      { label: "camelCase", value: camelCase(words) },
      { label: "PascalCase", value: pascalCase(words) },
      { label: "snake_case", value: snakeCase(words) },
      { label: "kebab-case", value: kebabCase(words) },
      { label: "Title Case", value: titleCase(words) },
      { label: "Sentence case", value: sentenceCase(value.input) },
      { label: "UPPERCASE", value: value.input.toUpperCase() },
      { label: "lowercase", value: value.input.toLowerCase() },
    ],
    [value.input, words]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Input text</span>
          <button
            type="button"
            onClick={() => {
              setValue({ input: "Frictionless utility for developers" });
              notify("Sample text loaded");
            }}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={value.input}
          onChange={(event) => setValue({ input: event.target.value })}
          className="min-h-[200px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
          placeholder="Paste text to transform"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {outputs.map((entry) => (
          <div key={entry.label} className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</p>
              <CopyButton value={entry.value} label="Copy" variant="ghost" />
            </div>
            <p className="mt-3 font-mono text-sm text-[var(--foreground)] break-all whitespace-pre-wrap">
              {entry.value || "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton
          type="button"
          onClick={async () => {
            try {
              await copyText(outputs.map((entry) => `${entry.label}: ${entry.value}`).join("\n"));
              notify("All cases copied");
            } catch (error) {
              console.error(error);
              notify("Unable to copy");
            }
          }}
        >
          Copy all cases
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => {
            setValue({ input: value.input.trim() });
            notify("Trimmed whitespace");
          }}
          variant="secondary"
        >
          Trim whitespace
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => {
            reset();
            notify("Case converter reset");
          }}
          variant="ghost"
        >
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
