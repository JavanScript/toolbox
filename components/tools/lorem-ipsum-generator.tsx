"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface LoremState {
  paragraphs: number;
  sentences: number;
  words: number;
  startWithLorem: boolean;
  output: string;
  error: string | null;
}

const WORD_BANK = [
  "craft",
  "frictionless",
  "velocity",
  "interface",
  "minimal",
  "flow",
  "privacy",
  "instant",
  "client",
  "native",
  "gradient",
  "luminosity",
  "palette",
  "command",
  "delight",
  "precision",
  "bold",
  "contrast",
  "geometry",
  "responsive",
  "keyboard",
  "aesthetic",
  "signal",
  "momentum",
  "texture",
  "depth",
  "spectrum",
  "effortless",
  "structure",
  "system",
  "clarity",
  "control",
  "harmony",
  "presence",
  "iteration",
  "focus",
  "ergonomic",
  "intentional",
  "composure",
  "ambient",
  "intuition",
  "vivid",
  "rhythm",
  "balance",
  "architect",
];

function getRandomWord() {
  const index = Math.floor(Math.random() * WORD_BANK.length);
  return WORD_BANK[index];
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function generateLorem({
  paragraphs,
  sentences,
  words,
  startWithLorem,
}: Pick<LoremState, "paragraphs" | "sentences" | "words" | "startWithLorem">) {
  const results: string[] = [];

  for (let p = 0; p < paragraphs; p += 1) {
    const paragraphSentences: string[] = [];
    for (let s = 0; s < sentences; s += 1) {
      const sentenceWords: string[] = [];
      for (let w = 0; w < words; w += 1) {
        sentenceWords.push(getRandomWord());
      }
      if (startWithLorem && p === 0 && s === 0) {
        sentenceWords[0] = "lorem";
        if (sentenceWords.length > 1) {
          sentenceWords[1] = "ipsum";
        }
      }
      const sentence = `${capitalize(sentenceWords.join(" "))}.`;
      paragraphSentences.push(sentence);
    }
    results.push(paragraphSentences.join(" "));
  }

  return results.join("\n\n");
}

export function LoremIpsumGenerator() {
  const { value, setValue, reset } = useLocalStorage<LoremState>("tool-lorem", {
    paragraphs: 3,
    sentences: 3,
    words: 12,
    startWithLorem: true,
    output: generateLorem({ paragraphs: 3, sentences: 3, words: 12, startWithLorem: true }),
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      if (value.paragraphs < 1 || value.paragraphs > 12) {
        throw new Error("Paragraphs must be between 1 and 12.");
      }
      if (value.sentences < 1 || value.sentences > 12) {
        throw new Error("Sentences must be between 1 and 12.");
      }
      if (value.words < 3 || value.words > 32) {
        throw new Error("Words per sentence must be between 3 and 32.");
      }
      const output = generateLorem({
        paragraphs: value.paragraphs,
        sentences: value.sentences,
        words: value.words,
        startWithLorem: value.startWithLorem,
      });
      setValue({ ...value, output, error: null });
      notify("Lorem ipsum generated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to generate text." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Lorem ipsum settings reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Paragraphs</span>
            <input
              type="number"
              min={1}
              max={12}
              value={value.paragraphs}
              onChange={(event) =>
                setValue({ ...value, paragraphs: Number(event.target.value), error: null })
              }
              className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-right font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Sentences / paragraph</span>
            <input
              type="number"
              min={1}
              max={12}
              value={value.sentences}
              onChange={(event) =>
                setValue({ ...value, sentences: Number(event.target.value), error: null })
              }
              className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-right font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Words / sentence</span>
            <input
              type="number"
              min={3}
              max={32}
              value={value.words}
              onChange={(event) =>
                setValue({ ...value, words: Number(event.target.value), error: null })
              }
              className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-right font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground)]">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              Start with "Lorem ipsum"
            </span>
            <input
              type="checkbox"
              checked={value.startWithLorem}
              onChange={(event) =>
                setValue({ ...value, startWithLorem: event.target.checked, error: null })
              }
              className="h-5 w-9 cursor-pointer appearance-none rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] transition before:inline-block before:h-4 before:w-4 before:-translate-x-3 before:rounded-full before:bg-[var(--foreground-muted)] before:transition checked:bg-[var(--accent)] checked:before:translate-x-3 checked:before:bg-[#0b0d12]"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setValue({
                paragraphs: 2,
                sentences: 4,
                words: 10,
                startWithLorem: false,
                output: generateLorem({ paragraphs: 2, sentences: 4, words: 10, startWithLorem: false }),
                error: null,
              });
              notify("Preset loaded");
            }}
            className="text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load design standup preset
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Generated text</span>
            <CopyButton value={value.output} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[320px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm leading-6 text-[var(--foreground)]"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Generate lorem ipsum
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
