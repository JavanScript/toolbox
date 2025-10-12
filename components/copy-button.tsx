"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { copyText } from "@/lib/clipboard";

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: "solid" | "outline" | "ghost";
}

export function CopyButton({ value, label = "Copy", variant = "solid" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { notify } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await copyText(value);
      setCopied(true);
      notify("Copied to clipboard");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  }, [notify, value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const variantClassName = {
    solid:
      "border-[var(--accent)]/80 bg-[var(--accent)] text-[#0b0d12] hover:bg-[#6baeff]",
    outline:
      "border-[var(--surface-border)]/70 bg-[var(--background-subtle)] text-[var(--foreground-muted)] hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]",
    ghost:
      "border-transparent bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
  }[variant];

  return (
    <button
      onClick={handleCopy}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 ${
        variantClassName
      } ${
        isPressed && variant === "solid"
          ? "translate-y-[1px] shadow-[inset_0_0_0_1px_rgba(10,12,20,0.4)]"
          : "shadow-[0_12px_35px_-28px_var(--glow)]"
      } ${
        copied
          ? "border-[var(--accent)]/80 bg-[var(--accent)] text-[#0b0d12]"
          : ""
      }`}
      type="button"
    >
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className={
          variant === "solid"
            ? "text-[#0b0d12]"
            : variant === "ghost"
            ? "text-[var(--foreground-muted)]"
            : "text-[var(--accent)]"
        }
      >
        <path
          d="M9 3a2 2 0 0 0-2 2v9h2V5h8V3H9Zm-4 4h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h10V9H5Z"
          fill="currentColor"
        />
      </svg>
      <span className="relative flex items-center gap-2">
        <span>{copied ? "Copied" : label}</span>
        <span
          className={`flex h-2 w-2 items-center justify-center rounded-full transition ${
            copied ? "bg-[#0b0d12]" : "bg-[var(--accent)]/60"
          }`}
          aria-hidden
        />
      </span>
    </button>
  );
}
