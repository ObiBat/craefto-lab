"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { UpdateType } from "@/lib/portal/types";

// ---------------------------------------------------------------------------
// Activity Item — single entry in an activity / updates feed
// ---------------------------------------------------------------------------

/* ── Type → colour mapping (left border + icon tint) ─────────────── */

const typeColorMap: Record<UpdateType, string> = {
  alignment: "border-l-blue-400",
  decision: "border-l-purple-400",
  blocker: "border-l-[hsl(var(--color-error))]",
  milestone: "border-l-amber-400",
  task_update: "border-l-[hsl(var(--color-success))]",
};

const typeIconBgMap: Record<UpdateType, string> = {
  alignment: "bg-blue-50 text-blue-500",
  decision: "bg-purple-50 text-purple-500",
  blocker: "bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]",
  milestone: "bg-amber-50 text-amber-500",
  task_update:
    "bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]",
};

/* ── Inline SVG icons (16 x 16) ─────────────────────────────────── */

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function GavelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1={4} x2={4} y1={22} y2={15} />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const typeIconMap: Record<UpdateType, React.FC<React.SVGProps<SVGSVGElement>>> =
  {
    alignment: CompassIcon,
    decision: GavelIcon,
    blocker: AlertIcon,
    milestone: FlagIcon,
    task_update: CheckIcon,
  };

/* ── Relative timestamp helper ───────────────────────────────────── */

function relativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ── Component ───────────────────────────────────────────────────── */

export interface ActivityItemProps {
  /** The type of update — controls icon & left-border color. */
  type: UpdateType;
  /** Short title describing the update. */
  title: string;
  /** Person who authored the update. */
  author: string;
  /** ISO timestamp or Date. */
  timestamp: string | Date;
  /** Name of the associated project. */
  projectName: string;
  className?: string;
}

export function ActivityItem({
  type,
  title,
  author,
  timestamp,
  projectName,
  className,
}: ActivityItemProps) {
  const Icon = typeIconMap[type];
  const formattedTime = relativeTime(timestamp);
  const isoString =
    typeof timestamp === "string" ? timestamp : timestamp.toISOString();

  return (
    <article
      className={cn(
        "group relative flex items-start gap-3.5 border-l-2 py-3.5 pl-4 pr-2 transition-colors duration-200 hover:bg-[hsl(var(--color-background-subtle))]",
        typeColorMap[type],
        className,
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          typeIconBgMap[type],
        )}
      >
        <Icon />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-[hsl(var(--color-foreground))]">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[hsl(var(--color-foreground-subtle))]">
          <span className="font-medium text-[hsl(var(--color-foreground-muted))]">
            {author}
          </span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={isoString} title={new Date(isoString).toLocaleString()}>
            {formattedTime}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{projectName}</span>
        </div>
      </div>
    </article>
  );
}
