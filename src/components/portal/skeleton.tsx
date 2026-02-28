import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Skeleton components — uses the existing `.skeleton` shimmer class from
// globals.css (warm cream palette gradient).
// ---------------------------------------------------------------------------

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Generic skeleton block. Apply width/height via className or style. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-[var(--radius-md)]", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* SkeletonText                                                       */
/* ------------------------------------------------------------------ */

export interface SkeletonTextProps {
  /** Number of lines to render. @default 3 */
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton h-3.5 rounded-full",
            i === lines - 1 ? "w-3/5" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SkeletonAvatar                                                     */
/* ------------------------------------------------------------------ */

export interface SkeletonAvatarProps {
  /** Diameter in pixels. @default 40 */
  size?: number;
  className?: string;
}

export function SkeletonAvatar({ size = 40, className }: SkeletonAvatarProps) {
  return (
    <div
      className={cn("skeleton rounded-full shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/* SkeletonCard — matches the shape of ProjectCard                    */
/* ------------------------------------------------------------------ */

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-6",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left content area */}
        <div className="flex-1 space-y-4">
          {/* Title + status pill */}
          <div className="flex items-center gap-3">
            <div className="skeleton h-5 w-36 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>

          {/* Description */}
          <SkeletonText lines={2} className="max-w-xs" />

          {/* Latest update */}
          <div className="skeleton h-10 w-full rounded-[var(--radius-md)]" />

          {/* Bottom row: avatars + task count */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonAvatar key={i} size={28} />
              ))}
            </div>
            <div className="skeleton h-4 w-16 rounded-full" />
          </div>
        </div>

        {/* Right — progress ring placeholder */}
        <div className="skeleton h-[80px] w-[80px] rounded-full shrink-0" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SkeletonDashboard — full dashboard skeleton (grid of cards)        */
/* ------------------------------------------------------------------ */

export interface SkeletonDashboardProps {
  /** Number of skeleton cards to render. @default 6 */
  count?: number;
  className?: string;
}

export function SkeletonDashboard({
  count = 6,
  className,
}: SkeletonDashboardProps) {
  return (
    <div className={cn("space-y-8", className)} aria-busy="true" aria-label="Loading dashboard">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48 rounded-full" />
          <div className="skeleton h-4 w-72 rounded-full" />
        </div>
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
