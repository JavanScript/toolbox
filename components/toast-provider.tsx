"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ToastContextValue {
  notify: (message: string) => void;
}

interface ToastItem {
  id: string;
  message: string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const handle = timers.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      setToasts((current) => [...current, { id, message }]);
      const timeout = window.setTimeout(() => removeToast(id), 3200);
      timers.current.set(id, timeout);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timeout) => window.clearTimeout(timeout));
      timers.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex max-w-sm flex-col gap-3 text-sm text-[var(--foreground)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[var(--accent)]/20 bg-[rgba(8,12,20,0.86)] px-4 py-3 shadow-[0_20px_60px_-40px_var(--glow)]"
          >
            <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[var(--accent)]" />
            <div className="flex-1 text-sm text-[var(--foreground)]">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="-mr-1 -mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
