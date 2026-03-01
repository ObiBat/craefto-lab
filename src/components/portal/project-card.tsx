"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/portal/types";
import { portalPath } from "@/lib/portal/routes";
import { StatusPill } from "./status-pill";
import { ProgressRing } from "./progress-ring";

// ---------------------------------------------------------------------------
// Project Card — dashboard grid card with asymmetric layout
// ---------------------------------------------------------------------------

export interface ProjectCardTeamMember {
  name: string;
  avatarUrl?: string;
}

export interface ProjectCardProps {
  /** Unique project identifier (used for URL). */
  id: string;
  /** Project display name. */
  name: string;
  /** Current project status. */
  status: ProjectStatus;
  /** Completion percentage 0-100. */
  progress: number;
  /** Short project description. */
  description: string;
  /** Most recent update text. */
  latestUpdate?: string;
  /** Team members to show as stacked avatars. */
  team?: ProjectCardTeamMember[];
  /** Total task count label (e.g. "12 tasks"). */
  taskCount?: number;
  /** Stagger index for entrance animation. */
  index?: number;
  className?: string;
}

/** Initials from a name string (first + last). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (
    (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
  ).toUpperCase();
}

export function ProjectCard({
  id,
  name,
  status,
  progress,
  description,
  latestUpdate,
  team = [],
  taskCount,
  index = 0,
  className,
}: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const MAX_AVATARS = 4;
  const visibleTeam = team.slice(0, MAX_AVATARS);
  const overflow = team.length - MAX_AVATARS;

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 20 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : {
              duration: 0.5,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      className={cn("group/card", className)}
      style={{ transform: "translateZ(0)" }}
    >
      <Link
        href={portalPath(`/projects/${id}`)}
        className="block rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 sm:p-6 shadow-[var(--shadow-sm)] transition-all duration-300 ease-[var(--ease-out)] hover:shadow-[var(--shadow-xl)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-background))]"
        aria-label={`View project: ${name}`}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-5">
          {/* ── Left: content ─────────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Title + status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="truncate font-heading text-base font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
                {name}
              </h3>
              <StatusPill status={status} />
            </div>

            {/* Description */}
            <p className="line-clamp-2 text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
              {description}
            </p>

            {/* Latest update */}
            {latestUpdate && (
              <div className="rounded-[var(--radius-md)] bg-[hsl(var(--color-background-subtle))] px-3 py-2">
                <p className="line-clamp-2 text-xs leading-relaxed text-[hsl(var(--color-foreground-subtle))]">
                  <span className="font-medium text-[hsl(var(--color-foreground-muted))]">
                    Latest:
                  </span>{" "}
                  {latestUpdate}
                </p>
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-1">
              {/* Team avatars */}
              {visibleTeam.length > 0 && (
                <div className="flex -space-x-2" aria-label={`${team.length} team members`}>
                  {visibleTeam.map((member, i) => (
                    <span
                      key={i}
                      className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--color-background))] bg-[hsl(var(--color-background-muted))] text-[10px] font-semibold text-[hsl(var(--color-foreground-muted))] ring-0"
                      title={member.name}
                    >
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(member.name)
                      )}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--color-background))] bg-[hsl(var(--color-accent-subtle))] text-[10px] font-semibold text-[hsl(var(--color-accent))]">
                      +{overflow}
                    </span>
                  )}
                </div>
              )}

              {/* Task count */}
              {typeof taskCount === "number" && (
                <span className="text-xs tabular-nums text-[hsl(var(--color-foreground-subtle))]">
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
              )}
            </div>
          </div>

          {/* ── Right: progress ring ──────────────────────────────── */}
          <div className="shrink-0 pt-1">
            <div className="hidden sm:block">
              <ProgressRing value={progress} status={status} size={72} strokeWidth={5} />
            </div>
            <div className="sm:hidden">
              <ProgressRing value={progress} status={status} size={56} strokeWidth={4} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
