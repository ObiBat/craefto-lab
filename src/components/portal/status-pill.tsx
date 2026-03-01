"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/portal/types";

// ---------------------------------------------------------------------------
// Status Pill — project status indicator with animated pulse dot
// ---------------------------------------------------------------------------

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight transition-colors select-none",
  {
    variants: {
      status: {
        on_track:
          "bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]",
        at_risk:
          "bg-[hsl(var(--color-warning-subtle))] text-[hsl(var(--color-warning))]",
        blocked:
          "bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]",
        completed:
          "bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-700))]",
        paused:
          "bg-[hsl(var(--color-neutral-100))] text-[hsl(var(--color-neutral-400))]",
      },
    },
    defaultVariants: {
      status: "on_track",
    },
  },
);

/** Statuses that are considered "active" and should show a pulsing dot. */
const ACTIVE_STATUSES = new Set<string>(["on_track", "at_risk", "blocked"]);

const dotColorMap: Record<string, string> = {
  on_track: "bg-[hsl(var(--color-success))]",
  at_risk: "bg-[hsl(var(--color-warning))]",
  blocked: "bg-[hsl(var(--color-error))]",
  completed: "bg-[hsl(var(--color-neutral-700))]",
  paused: "bg-[hsl(var(--color-neutral-400))]",
};

const labelMap: Record<string, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  blocked: "Blocked",
  completed: "Completed",
  paused: "Paused",
};

export interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusPillVariants> {
  /** Override the displayed label. Falls back to a human-readable default. */
  label?: string;
}

const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status = "on_track", label, ...props }, ref) => {
    const resolvedStatus = status ?? "on_track";
    const isActive = ACTIVE_STATUSES.has(resolvedStatus);

    return (
      <span
        ref={ref}
        className={cn(statusPillVariants({ status }), className)}
        role="status"
        aria-label={`Project status: ${label ?? labelMap[resolvedStatus]}`}
        {...props}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2" aria-hidden="true">
          {isActive && (
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-75 animate-ping",
                dotColorMap[resolvedStatus],
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              dotColorMap[resolvedStatus],
            )}
          />
        </span>

        {label ?? labelMap[resolvedStatus]}
      </span>
    );
  },
);
StatusPill.displayName = "StatusPill";

export { StatusPill, statusPillVariants };
