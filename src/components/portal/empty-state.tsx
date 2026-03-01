import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Empty State — editorial placeholder with optional CTA
// ---------------------------------------------------------------------------

/* ── Default illustration placeholder (simple ink sketch style SVG) ─ */

function DefaultIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x={20}
        y={24}
        width={80}
        height={72}
        rx={8}
        stroke="hsl(var(--color-border-strong))"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <circle
        cx={44}
        cy={50}
        r={10}
        stroke="hsl(var(--color-foreground-subtle))"
        strokeWidth={1.5}
      />
      <path
        d="M60 70l12-16 16 24H32l12-18 8 10z"
        stroke="hsl(var(--color-foreground-subtle))"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export interface EmptyStateProps {
  /** Custom illustration element. Falls back to a default sketch SVG. */
  illustration?: React.ReactNode;
  /** Headline text. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Optional call-to-action element (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
      role="status"
    >
      {/* Illustration */}
      <div className="mb-6">
        {illustration ?? <DefaultIllustration />}
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
