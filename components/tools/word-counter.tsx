"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface WordCounterState {
  text: string;
}

const SAMPLE_TEXT = `Devtools.io helps you build, test, and refine interfaces faster.`;

function countWords(text: string) {
  const matches = text.trim().match(/[^\s]+/g);
  return matches ? matches.length : 0;
}

function countSentences(text: string) {
  const matches = text.match(/[^.!?]+[.!?\n]+/g);
  return matches ? matches.length : text.trim() ? 1 : 0;
}

function countParagraphs(text: string) {
  const paragraphs = text.trim().split(/\n{2,}/g).filter(Boolean);
  return paragraphs.length || (text.trim() ? 1 : 0);
}

function countCharacters(text: string) {
  return text.length;
}

function estimateReadingTime(wordCount: number) {
  if (wordCount === 0) return "0 min";
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min`;
}

export function WordCounter() {
  const { value, setValue, reset } = useLocalStorage<WordCounterState>("tool-word-counter", {
    text: SAMPLE_TEXT,
  });
  const { notify } = useToast();

  const stats = useMemo(() => {
    const text = value.text;
    const words = countWords(text);
    return {
      words,
      characters: countCharacters(text),
      sentences: countSentences(text),
      paragraphs: countParagraphs(text),
      readingTime: estimateReadingTime(words),
    };
  }, [value.text]);

  const handleReset = () => {
    reset();
    notify("Word counter reset");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Text</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Reset text
            </button>
          </div>
          <textarea
            value={value.text}
            onChange={(event) => setValue({ text: event.target.value })}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste or type text to analyze"
          />
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Summary</p>
            <CopyButton value={JSON.stringify(stats, null, 2)} label="Copy stats" variant="outline" />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm text-[var(--foreground)]">
            <div>
              <dt className="text-[var(--foreground-muted)]">Words</dt>
              <dd className="text-xl font-semibold text-[var(--foreground)]">{stats.words}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">Characters</dt>
              <dd className="text-xl font-semibold text-[var(--foreground)]">{stats.characters}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">Sentences</dt>
              <dd className="text-xl font-semibold text-[var(--foreground)]">{stats.sentences}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">Paragraphs</dt>
              <dd className="text-xl font-semibold text-[var(--foreground)]">{stats.paragraphs}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--foreground-muted)]">Estimated reading time</dt>
              <dd className="text-xl font-semibold text-[var(--foreground)]">{stats.readingTime}</dd>
            </div>
          </dl>
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
