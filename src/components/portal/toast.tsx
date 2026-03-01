"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ============================================================================
// ICONS
// ============================================================================

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

const TOAST_ICONS: Record<ToastType, React.FC> = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success:
    "bg-[hsl(var(--color-success-subtle))] border-[hsl(var(--color-success))] text-[hsl(var(--color-success))]",
  error:
    "bg-[hsl(var(--color-error-subtle))] border-[hsl(var(--color-error))] text-[hsl(var(--color-error))]",
  info: "bg-[hsl(var(--color-background-subtle))] border-[hsl(var(--color-border-strong))] text-[hsl(var(--color-foreground-muted))]",
};

const TOAST_TEXT: Record<ToastType, string> = {
  success: "text-[hsl(var(--color-foreground))]",
  error: "text-[hsl(var(--color-foreground))]",
  info: "text-[hsl(var(--color-foreground))]",
};

// ============================================================================
// PROVIDER
// ============================================================================

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = TOAST_ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "pointer-events-auto flex items-center gap-2.5 rounded-[var(--radius-lg)] border px-4 py-3 shadow-lg",
                  TOAST_STYLES[t.type],
                )}
              >
                <span className="shrink-0">
                  <Icon />
                </span>
                <p className={cn("text-sm font-medium", TOAST_TEXT[t.type])}>
                  {t.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="ml-2 shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100 min-h-0"
                  aria-label="Dismiss"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
