"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ToolButtonVariant = "primary" | "secondary" | "ghost";

export interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ToolButtonVariant;
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const buttonBase =
  "rounded-xl px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60";

const buttonVariants: Record<ToolButtonVariant, string> = {
  primary: `${buttonBase} bg-[var(--accent)] text-[#0b0d12] shadow-[0_20px_45px_-25px_var(--glow)] hover:bg-[#6baeff]`,
  secondary: `${buttonBase} border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] text-[var(--foreground)] hover:border-[var(--accent)]/50`,
  ghost: `${buttonBase} border border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]`,
};

export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants[variant], className)} {...props} />
  )
);

ToolButton.displayName = "ToolButton";

interface ToolErrorProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

export function ToolError({ message, action, className }: ToolErrorProps) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[var(--accent)]/40 bg-[rgba(88,166,255,0.06)] px-3 py-2 text-xs text-[var(--accent)]",
        className
      )}
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
        <path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" fill="currentColor" />
      </svg>
      <span className="flex-1 break-words">{message}</span>
      {action ?? null}
    </div>
  );
}
