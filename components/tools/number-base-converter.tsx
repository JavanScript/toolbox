"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface BaseConversionState {
  inputValue: string;
  inputBase: number;
  outputs: {
    binary: string;
    octal: string;
    decimal: string;
    hexadecimal: string;
  };
  error: string | null;
}

const EMPTY_OUTPUT = { binary: "", octal: "", decimal: "", hexadecimal: "" };

export function NumberBaseConverter() {
  const { value, setValue, reset } = useLocalStorage<BaseConversionState>("tool-number-base", {
    inputValue: "42",
    inputBase: 10,
    outputs: {
      binary: "101010",
      octal: "52",
      decimal: "42",
      hexadecimal: "2A",
    },
    error: null,
  });
  const { notify } = useToast();

  const handleConvert = useCallback(() => {
    const trimmed = value.inputValue.trim();
    if (!trimmed) {
      setValue({ ...value, outputs: EMPTY_OUTPUT, error: "Enter a value to convert." });
      return;
    }

    const parsed = parseInt(trimmed, value.inputBase);
    if (Number.isNaN(parsed)) {
      setValue({ ...value, outputs: EMPTY_OUTPUT, error: "Input does not match the selected base." });
      return;
    }

    const outputs = {
      binary: parsed.toString(2),
      octal: parsed.toString(8),
      decimal: parsed.toString(10),
      hexadecimal: parsed.toString(16).toUpperCase(),
    };

    setValue({ inputValue: value.inputValue, inputBase: value.inputBase, outputs, error: null });
    notify("Number converted across bases");
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Number converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Input value</span>
            <input
              value={value.inputValue}
              onChange={(event) => setValue({ ...value, inputValue: event.target.value })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="e.g. 2A"
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Input base</span>
            <select
              value={value.inputBase}
              onChange={(event) => setValue({ ...value, inputBase: Number(event.target.value) })}
              className="w-full rounded-3xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] p-4 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            >
              <option value={2}>Binary (2)</option>
              <option value={8}>Octal (8)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hexadecimal (16)</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Binary", value: value.outputs.binary },
            { label: "Octal", value: value.outputs.octal },
            { label: "Decimal", value: value.outputs.decimal },
            { label: "Hexadecimal", value: value.outputs.hexadecimal },
          ].map((entry) => (
            <div key={entry.label} className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">{entry.label}</p>
                <CopyButton value={entry.value} label="Copy" variant="ghost" />
              </div>
              <p className="mt-3 font-mono text-lg text-[var(--foreground)] break-all">
                {entry.value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleConvert}>
          Convert number
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
        <ToolButton
          type="button"
          onClick={() => {
            const sample = "2A";
            setValue({
              inputValue: sample,
              inputBase: 16,
              outputs: {
                binary: parseInt(sample, 16).toString(2),
                octal: parseInt(sample, 16).toString(8),
                decimal: parseInt(sample, 16).toString(10),
                hexadecimal: sample.toUpperCase(),
              },
              error: null,
            });
            notify("Sample number loaded");
          }}
          variant="secondary"
        >
          Load sample
        </ToolButton>
      </div>
    </div>
  );
}
