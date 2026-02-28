"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { UpdateType } from "@/lib/portal/types";

// ---------------------------------------------------------------------------
// Update Type Badge — colour-coded pill with icon + text
// ---------------------------------------------------------------------------

/* ── Colour maps ─────────────────────────────────────────────────── */

const badgeColorMap: Record<UpdateType, string> = {
  alignment: "bg-blue-50 text-blue-600 ring-blue-200/60",
  decision: "bg-purple-50 text-purple-600 ring-purple-200/60",
  blocker:
    "bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))] ring-[hsl(var(--color-error)/0.15)]",
  milestone: "bg-amber-50 text-amber-600 ring-amber-200/60",
  task_update:
    "bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))] ring-[hsl(var(--color-success)/0.15)]",
};

const labelMap: Record<UpdateType, string> = {
  alignment: "Alignment",
  decision: "Decision",
  blocker: "Blocker",
  milestone: "Milestone",
  task_update: "Task Update",
};

/* ── Mini icons (12x12) ──────────────────────────────────────────── */

function CompassMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function GavelMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

function AlertMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FlagMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1={4} x2={4} y1={22} y2={15} />
    </svg>
  );
}

function CheckMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const iconMap: Record<UpdateType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  alignment: CompassMini,
  decision: GavelMini,
  blocker: AlertMini,
  milestone: FlagMini,
  task_update: CheckMini,
};

/* ── Component ───────────────────────────────────────────────────── */

export interface UpdateTypeBadgeProps {
  type: UpdateType;
  /** Override the displayed label. */
  label?: string;
  className?: string;
}

export function UpdateTypeBadge({
  type,
  label,
  className,
}: UpdateTypeBadgeProps) {
  const Icon = iconMap[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight ring-1 ring-inset select-none",
        badgeColorMap[type],
        className,
      )}
    >
      <Icon />
      {label ?? labelMap[type]}
    </span>
  );
}
