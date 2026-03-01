"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tab System — animated underline indicator + content transitions
// ---------------------------------------------------------------------------

export interface TabItem {
  /** Unique value identifier. */
  value: string;
  /** Visible tab label. */
  label: string;
  /** Optional count displayed as a small badge. */
  count?: number;
  /** Content to render when this tab is active. */
  content: React.ReactNode;
}

export interface TabSystemProps {
  /** Array of tab definitions. */
  tabs: TabItem[];
  /** Controlled active value. Falls back to the first tab if unset. */
  defaultValue?: string;
  /** Callback when active tab changes. */
  onChange?: (value: string) => void;
  className?: string;
}

export function TabSystem({
  tabs,
  defaultValue,
  onChange,
  className,
}: TabSystemProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = React.useState(
    defaultValue ?? tabs[0]?.value ?? "",
  );

  const handleChange = (value: string) => {
    setActive(value);
    onChange?.(value);
  };

  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div className={cn("w-full", className)}>
      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div
        className="relative flex overflow-x-auto border-b border-[hsl(var(--color-border))] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              role="tab"
              type="button"
              id={`tab-${tab.value}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleChange(tab.value)}
              onKeyDown={(e) => {
                const idx = tabs.findIndex((t) => t.value === active);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = tabs[(idx + 1) % tabs.length];
                  handleChange(next.value);
                  (
                    document.getElementById(`tab-${next.value}`) as HTMLElement
                  )?.focus();
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev =
                    tabs[(idx - 1 + tabs.length) % tabs.length];
                  handleChange(prev.value);
                  (
                    document.getElementById(`tab-${prev.value}`) as HTMLElement
                  )?.focus();
                }
              }}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 rounded-t-[var(--radius-sm)] min-h-[44px]",
                isActive
                  ? "text-[hsl(var(--color-foreground))]"
                  : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]",
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                      isActive
                        ? "bg-[hsl(var(--color-accent))] text-white"
                        : "bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>

              {/* Animated underline */}
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-[hsl(var(--color-accent))]"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab.value}
              id={`tabpanel-${activeTab.value}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab.value}`}
              tabIndex={0}
              initial={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
              }
            >
              {activeTab.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
