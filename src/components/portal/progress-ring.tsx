"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/portal/types";

// ---------------------------------------------------------------------------
// Progress Ring — animated SVG circular progress indicator
// ---------------------------------------------------------------------------

const strokeColorMap: Record<string, string> = {
  on_track: "hsl(var(--color-success))",
  at_risk: "hsl(var(--color-warning))",
  blocked: "hsl(var(--color-error))",
  completed: "hsl(var(--color-neutral-700))",
  paused: "hsl(var(--color-neutral-400))",
};

export interface ProgressRingProps {
  /** Progress value from 0 to 100. */
  value: number;
  /** Diameter of the ring in pixels. @default 80 */
  size?: number;
  /** Stroke width in pixels. @default 6 */
  strokeWidth?: number;
  /** Show the percentage label in the center. @default true */
  showLabel?: boolean;
  /** Controls stroke color. Falls back to accent if not provided. */
  status?: ProjectStatus;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  status,
  className,
}: ProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor = status
    ? strokeColorMap[status]
    : "hsl(var(--color-accent))";

  // Count-up state for the label
  const [displayValue, setDisplayValue] = React.useState(
    prefersReducedMotion ? clamped : 0,
  );

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(clamped);
      return;
    }

    let raf: number;
    let start: number | null = null;
    const duration = 1000; // 1 second

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.round(eased * clamped));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [clamped, prefersReducedMotion]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--color-border))"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { duration: 1, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </svg>

      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center font-heading text-sm font-semibold text-[hsl(var(--color-foreground))] tabular-nums"
          aria-hidden="true"
        >
          {displayValue}%
        </span>
      )}
    </div>
  );
}
