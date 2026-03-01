'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchProjectDetail, updateTaskStatus } from '@/lib/portal/queries';
import { useAuth } from '@/lib/portal/auth-context';
import { useProjectRealtime } from '@/lib/portal/realtime';
import { StatusPill } from '@/components/portal/status-pill';
import { ProgressRing } from '@/components/portal/progress-ring';
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  smoothTransition,
  defaultTransition,
  instantTransition,
} from '@/components/ui/motion';
import type {
  ProjectDetailData,
  Task,
  Update,
  TeamMember,
  PortalUser,
  TaskStatus,
  TaskView,
  ProjectTab,
  UpdateType,
  TimelineEvent,
  TaskPriority,
} from '@/lib/portal/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const TASK_STATUS_ORDER: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
];

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-neutral-300',
  todo: 'bg-neutral-400',
  in_progress: 'bg-[hsl(var(--color-accent))]',
  in_review: 'bg-[hsl(var(--color-warning))]',
  done: 'bg-[hsl(var(--color-success))]',
  cancelled: 'bg-neutral-300',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'bg-[hsl(var(--color-error))]',
  high: 'bg-[hsl(var(--color-warning))]',
  medium: 'bg-[hsl(var(--color-accent))]',
  low: 'bg-[hsl(var(--color-neutral-400))]',
  none: 'bg-[hsl(var(--color-neutral-300))]',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

const TAB_CONFIG: { id: ProjectTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'updates',
    label: 'Alignment & Decisions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1z" />
        <path d="M4 5h8M4 8h6M4 11h4" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M2 8h12M2 12h12" />
        <circle cx="14" cy="4" r="0.5" fill="currentColor" />
        <circle cx="14" cy="8" r="0.5" fill="currentColor" />
        <circle cx="14" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'team',
    label: 'Team',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v12" />
        <circle cx="8" cy="4" r="1.5" fill="currentColor" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        <path d="M9.5 4H13M2.5 8H6.5M9.5 12H13" />
      </svg>
    ),
  },
];

const UPDATE_TYPE_STYLES: Record<
  UpdateType,
  { bg: string; text: string; label: string }
> = {
  alignment: {
    bg: 'bg-[hsl(var(--color-accent-subtle))]',
    text: 'text-[hsl(var(--color-accent))]',
    label: 'Alignment',
  },
  decision: {
    bg: 'bg-[hsl(var(--color-warning-subtle))]',
    text: 'text-[hsl(var(--color-warning))]',
    label: 'Decision',
  },
  blocker: {
    bg: 'bg-[hsl(var(--color-error-subtle))]',
    text: 'text-[hsl(var(--color-error))]',
    label: 'Blocker',
  },
  milestone: {
    bg: 'bg-[hsl(var(--color-success-subtle))]',
    text: 'text-[hsl(var(--color-success))]',
    label: 'Milestone',
  },
  task_update: {
    bg: 'bg-[hsl(var(--color-neutral-100))]',
    text: 'text-[hsl(var(--color-neutral-600))]',
    label: 'Task Update',
  },
};

const TIMELINE_TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  update: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V2a1 1 0 00-1-1z" />
        <path d="M4 4h6M4 7h4" />
      </svg>
    ),
    color: 'bg-[hsl(var(--color-accent))]',
  },
  task_completed: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 7.5l2.5 2.5 4.5-5" />
      </svg>
    ),
    color: 'bg-[hsl(var(--color-success))]',
  },
  status_change: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 7h12M9 3l4 4-4 4" />
      </svg>
    ),
    color: 'bg-[hsl(var(--color-warning))]',
  },
  member_joined: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="4.5" r="2.5" />
        <path d="M2 13c0-2.8 2.2-4 5-4s5 1.2 5 4" />
      </svg>
    ),
    color: 'bg-[hsl(var(--color-neutral-500))]',
  },
  milestone: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2v10M2 2l5 3-5 3" />
      </svg>
    ),
    color: 'bg-[hsl(var(--color-success))]',
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatDateRange(
  start: string | null,
  end: string | null
): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  if (start && end) return `${fmt(start)} - ${fmt(end)}`;
  if (start) return `Started ${fmt(start)}`;
  if (end) return `Due ${fmt(end)}`;
  return 'No dates set';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getNextStatus(status: TaskStatus): TaskStatus {
  const idx = TASK_STATUS_ORDER.indexOf(status);
  if (idx === -1 || idx === TASK_STATUS_ORDER.length - 1) return status;
  return TASK_STATUS_ORDER[idx + 1];
}

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

function Avatar({
  user,
  size = 'md',
  className,
}: {
  user?: PortalUser | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={cn(
          'rounded-full object-cover ring-2 ring-[hsl(var(--color-background))]',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] font-heading font-semibold text-[hsl(var(--color-accent))] ring-2 ring-[hsl(var(--color-background))]',
        sizeClasses[size],
        className
      )}
      aria-label={user?.full_name ?? 'Unknown user'}
    >
      {user ? getInitials(user.full_name) : '?'}
    </div>
  );
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      {/* Header skeleton */}
      <div className="border-b border-[hsl(var(--color-border))]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="skeleton h-5 w-24 rounded-md" />
            <div className="skeleton h-5 w-3 rounded" />
            <div className="skeleton h-5 w-40 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Project header skeleton */}
        <div className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="skeleton h-9 w-72 rounded-lg" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-4 w-full max-w-xl rounded" />
              <div className="flex items-center gap-4">
                <div className="skeleton h-4 w-48 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="skeleton h-16 w-16 rounded-full" />
              <div className="skeleton h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-8 flex gap-1 border-b border-[hsl(var(--color-border))]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-10 w-36 rounded-t-lg" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton h-32 w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UPDATE TYPE BADGE (inline version)
// ============================================================================

function UpdateBadge({ type }: { type: UpdateType }) {
  const style = UPDATE_TYPE_STYLES[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight',
        style.bg,
        style.text
      )}
    >
      {style.label}
    </span>
  );
}

// ============================================================================
// TAG BADGE
// ============================================================================

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[hsl(var(--color-background-subtle))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--color-foreground-muted))] ring-1 ring-inset ring-[hsl(var(--color-border))]">
      {tag}
    </span>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))]/50 px-8 py-16 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]">
        {icon}
      </div>
      <h3 className="mb-1 font-heading text-base font-semibold text-[hsl(var(--color-foreground))]">
        {title}
      </h3>
      <p className="max-w-xs text-sm text-[hsl(var(--color-foreground-subtle))]">
        {description}
      </p>
    </motion.div>
  );
}

// ============================================================================
// TAB 1: ALIGNMENT & DECISIONS
// ============================================================================

function UpdatesTab({ updates }: { updates: Update[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return updates.filter(
      (u) => u.type === 'alignment' || u.type === 'decision'
    );
  }, [updates]);

  const sorted = useMemo(() => {
    const pinned = filtered.filter((u) => u.pinned);
    const unpinned = filtered.filter((u) => !u.pinned);
    return [...pinned, ...unpinned];
  }, [filtered]);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        }
        title="No updates yet"
        description="Share your first alignment update to keep stakeholders informed."
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {sorted.map((update) => {
        const isExpanded = expandedId === update.id;
        const isLongContent = update.content.length > 200;
        const preview = isLongContent
          ? update.content.slice(0, 200) + '...'
          : update.content;

        return (
          <motion.div
            key={update.id}
            variants={prefersReducedMotion ? fadeIn : staggerItem}
            transition={
              prefersReducedMotion ? instantTransition : smoothTransition
            }
            layout
            className={cn(
              'group relative overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] transition-shadow duration-200',
              'hover:shadow-md',
              update.pinned && 'ring-1 ring-[hsl(var(--color-accent))]/20'
            )}
          >
            {/* Pin indicator */}
            {update.pinned && (
              <div className="absolute right-3 top-3 text-[hsl(var(--color-accent))]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  aria-label="Pinned"
                >
                  <path d="M9.828 1.172a.5.5 0 01.707 0l2.293 2.293a.5.5 0 010 .707L10.5 6.5l.5 3.5-3.5-.5L5.172 11.828a.5.5 0 01-.707 0L2.172 9.535a.5.5 0 010-.707L4.5 6.5 1 3l3.5.5L6.828 1.172a.5.5 0 01.707 0l2.293 0z" />
                </svg>
              </div>
            )}

            <button
              onClick={() =>
                setExpandedId(isExpanded ? null : update.id)
              }
              className="w-full cursor-pointer p-5 text-left min-h-0"
              aria-expanded={isExpanded}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <UpdateBadge type={update.type} />
                {update.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>

              <h3 className="mb-2 font-heading text-base font-semibold text-[hsl(var(--color-foreground))] leading-snug">
                {update.title}
              </h3>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isExpanded ? 'full' : 'preview'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
                    {isExpanded ? update.content : preview}
                  </p>
                </motion.div>
              </AnimatePresence>

              {isLongContent && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--color-accent))]">
                  {isExpanded ? 'Show less' : 'Read more'}
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M3 4.5l3 3 3-3" />
                  </motion.svg>
                </span>
              )}

              {/* Author + timestamp */}
              <div className="mt-4 flex items-center gap-2 border-t border-[hsl(var(--color-border-subtle))] pt-3">
                <Avatar user={update.author} size="sm" />
                <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">
                  {update.author?.full_name ?? 'Unknown'}
                </span>
                <span className="text-[hsl(var(--color-neutral-300))]">
                  &middot;
                </span>
                <time className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                  {relativeTime(update.created_at)}
                </time>
              </div>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// TAB 2: TASKS — KANBAN VIEW
// ============================================================================

function KanbanColumn({
  status,
  tasks,
  onStatusChange,
}: {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex w-[280px] flex-shrink-0 flex-col sm:w-auto sm:flex-1">
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn('h-2 w-2 rounded-full', TASK_STATUS_COLORS[status])}
        />
        <span className="font-heading text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-foreground-muted))]">
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[hsl(var(--color-background-muted))] px-1.5 text-[10px] font-semibold tabular-nums text-[hsl(var(--color-foreground-subtle))]">
          {tasks.length}
        </span>
      </div>

      {/* Cards container */}
      <div className="flex flex-col gap-2 rounded-xl bg-[hsl(var(--color-background-subtle))]/50 p-2 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 8 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={
                prefersReducedMotion ? instantTransition : { duration: 0.2 }
              }
              className="group/card rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-3 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="flex-1 text-sm font-medium leading-snug text-[hsl(var(--color-foreground))]">
                  {task.title}
                </h4>
                <div
                  className={cn(
                    'mt-1 h-2 w-2 flex-shrink-0 rounded-full',
                    PRIORITY_COLORS[task.priority]
                  )}
                  title={PRIORITY_LABELS[task.priority]}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.assignee && (
                    <Avatar user={task.assignee} size="sm" />
                  )}
                  {task.due_date && (
                    <span className="text-[11px] text-[hsl(var(--color-foreground-subtle))]">
                      {new Date(task.due_date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  )}
                </div>

                {/* Move forward/back buttons */}
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
                  {TASK_STATUS_ORDER.indexOf(status) > 0 && (
                    <button
                      onClick={() =>
                        onStatusChange(
                          task.id,
                          TASK_STATUS_ORDER[
                            TASK_STATUS_ORDER.indexOf(status) - 1
                          ]
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--color-foreground-subtle))] transition-colors hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))] min-h-0"
                      title={`Move to ${TASK_STATUS_LABELS[TASK_STATUS_ORDER[TASK_STATUS_ORDER.indexOf(status) - 1]]}`}
                      aria-label={`Move task to ${TASK_STATUS_LABELS[TASK_STATUS_ORDER[TASK_STATUS_ORDER.indexOf(status) - 1]]}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7.5 2.5l-3 3.5 3 3.5" />
                      </svg>
                    </button>
                  )}
                  {TASK_STATUS_ORDER.indexOf(status) <
                    TASK_STATUS_ORDER.length - 1 && (
                    <button
                      onClick={() =>
                        onStatusChange(
                          task.id,
                          TASK_STATUS_ORDER[
                            TASK_STATUS_ORDER.indexOf(status) + 1
                          ]
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--color-foreground-subtle))] transition-colors hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))] min-h-0"
                      title={`Move to ${TASK_STATUS_LABELS[TASK_STATUS_ORDER[TASK_STATUS_ORDER.indexOf(status) + 1]]}`}
                      aria-label={`Move task to ${TASK_STATUS_LABELS[TASK_STATUS_ORDER[TASK_STATUS_ORDER.indexOf(status) + 1]]}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4.5 2.5l3 3.5-3 3.5" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-6 text-xs text-[hsl(var(--color-foreground-subtle))]">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanView({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-3 sm:gap-4" style={{ minWidth: '1200px' }}>
        {TASK_STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={grouped[status]}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: TASKS — LIST VIEW
// ============================================================================

function TaskListView({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  type SortKey = 'title' | 'status' | 'priority' | 'assignee' | 'due_date';
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortAsc, setSortAsc] = useState(true);

  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
    none: 4,
  };
  const statusOrder: Record<TaskStatus, number> = {
    backlog: 0,
    todo: 1,
    in_progress: 2,
    in_review: 3,
    done: 4,
    cancelled: 5,
  };

  const sorted = useMemo(() => {
    const copy = [...tasks];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'status':
          cmp = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'priority':
          cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'assignee':
          cmp = (a.assignee?.full_name ?? 'zzz').localeCompare(
            b.assignee?.full_name ?? 'zzz'
          );
          break;
        case 'due_date':
          cmp =
            new Date(a.due_date ?? '9999').getTime() -
            new Date(b.due_date ?? '9999').getTime();
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [tasks, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((p) => !p);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortHeader = ({
    label,
    sortKeyVal,
    className,
  }: {
    label: string;
    sortKeyVal: SortKey;
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(sortKeyVal)}
      className={cn(
        'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))] transition-colors hover:text-[hsl(var(--color-foreground))] min-h-0',
        className
      )}
    >
      {label}
      {sortKey === sortKeyVal && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={cn(
            'transition-transform',
            !sortAsc && 'rotate-180'
          )}
        >
          <path d="M5 7L1 3h8L5 7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-[640px]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_90px_120px_90px] gap-3 border-b border-[hsl(var(--color-border))] px-4 pb-2">
          <SortHeader label="Title" sortKeyVal="title" />
          <SortHeader label="Status" sortKeyVal="status" />
          <SortHeader label="Priority" sortKeyVal="priority" />
          <SortHeader label="Assignee" sortKeyVal="assignee" />
          <SortHeader label="Due" sortKeyVal="due_date" />
        </div>

        {/* Rows */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {sorted.map((task) => (
            <motion.div
              key={task.id}
              variants={
                prefersReducedMotion ? fadeIn : staggerItem
              }
              transition={
                prefersReducedMotion
                  ? instantTransition
                  : { duration: 0.2 }
              }
              className="grid grid-cols-[1fr_100px_90px_120px_90px] gap-3 border-b border-[hsl(var(--color-border-subtle))] px-4 py-3 transition-colors hover:bg-[hsl(var(--color-background-subtle))]/50"
            >
              <span className="truncate text-sm font-medium text-[hsl(var(--color-foreground))]">
                {task.title}
              </span>

              <button
                onClick={() =>
                  onStatusChange(task.id, getNextStatus(task.status))
                }
                className="flex items-center gap-1.5 min-h-0"
                title={`Click to change status (currently ${TASK_STATUS_LABELS[task.status]})`}
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    TASK_STATUS_COLORS[task.status]
                  )}
                />
                <span className="truncate text-xs text-[hsl(var(--color-foreground-muted))]">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    PRIORITY_COLORS[task.priority]
                  )}
                />
                <span className="text-xs text-[hsl(var(--color-foreground-muted))]">
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar user={task.assignee} size="sm" />
                    <span className="truncate text-xs text-[hsl(var(--color-foreground-muted))]">
                      {task.assignee.full_name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                    Unassigned
                  </span>
                )}
              </div>

              <span className="text-xs tabular-nums text-[hsl(var(--color-foreground-subtle))]">
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    )
                  : '--'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: TASKS (combined)
// ============================================================================

function TasksTab({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [view, setView] = useState<TaskView>('kanban');

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        }
        title="No tasks yet"
        description="Tasks will appear here once they are created for this project."
      />
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] p-0.5">
          <button
            onClick={() => setView('kanban')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all min-h-0',
              view === 'kanban'
                ? 'bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] shadow-xs'
                : 'text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]'
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="4" height="12" rx="1" />
              <rect x="7" y="1" width="4" height="8" rx="1" />
            </svg>
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all min-h-0',
              view === 'list'
                ? 'bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] shadow-xs'
                : 'text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]'
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h10M2 7h10M2 11h10" />
            </svg>
            List
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanView
              tasks={tasks}
              onStatusChange={onStatusChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <TaskListView
              tasks={tasks}
              onStatusChange={onStatusChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TAB 3: TEAM
// ============================================================================

function TeamTab({
  members,
}: {
  members: (TeamMember & { user: PortalUser })[];
}) {
  const prefersReducedMotion = useReducedMotion();

  if (members.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
        }
        title="No team members"
        description="Team members will appear here once they are added to this project."
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          variants={
            prefersReducedMotion
              ? fadeIn
              : {
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }
          }
          transition={
            prefersReducedMotion
              ? instantTransition
              : {
                  ...smoothTransition,
                  delay: index * 0.06,
                }
          }
          whileHover={
            prefersReducedMotion
              ? undefined
              : { y: -2, transition: { duration: 0.2 } }
          }
          className="group relative overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-accent-subtle))] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <Avatar user={member.user} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-sm font-semibold text-[hsl(var(--color-foreground))]">
                  {member.user.full_name}
                </h3>
                <p className="truncate text-xs text-[hsl(var(--color-accent))] font-medium">
                  {member.role_in_project}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[hsl(var(--color-foreground-subtle))]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="1" y="2.5" width="10" height="7.5" rx="1" />
                <path d="M1 4.5l5 3 5-3" />
              </svg>
              <span className="truncate">{member.user.email}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// TAB 4: TIMELINE
// ============================================================================

function TimelineItem({
  event,
  index,
  isLast,
}: {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const isLeft = index % 2 === 0;
  const config = TIMELINE_TYPE_CONFIG[event.type] ?? TIMELINE_TYPE_CONFIG.update;

  return (
    <div
      ref={ref}
      className={cn(
        'relative grid gap-4',
        // Desktop: alternating layout
        'md:grid-cols-[1fr_40px_1fr]',
        // Mobile: single column
        'grid-cols-[40px_1fr]'
      )}
    >
      {/* Left content (desktop only) */}
      <div
        className={cn(
          'hidden md:flex',
          isLeft ? 'justify-end' : ''
        )}
      >
        {isLeft && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: -16 }
            }
            animate={
              isInView
                ? { opacity: 1, x: 0 }
                : prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -16 }
            }
            transition={
              prefersReducedMotion
                ? instantTransition
                : { ...smoothTransition, delay: 0.1 }
            }
            className="max-w-sm rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 shadow-xs transition-shadow hover:shadow-sm"
          >
            <TimelineCardContent event={event} />
          </motion.div>
        )}
      </div>

      {/* Center line + dot */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }
          }
          animate={
            isInView
              ? { opacity: 1, scale: 1 }
              : prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0 }
          }
          transition={
            prefersReducedMotion
              ? instantTransition
              : { type: 'spring', stiffness: 300, damping: 20 }
          }
          className={cn(
            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white',
            config.color
          )}
        >
          {config.icon}
        </motion.div>
        {!isLast && (
          <div className="w-px flex-1 bg-[hsl(var(--color-border))]" />
        )}
      </div>

      {/* Right content (desktop) / Main content (mobile) */}
      <div
        className={cn(
          'md:flex pb-8',
          !isLeft ? 'justify-start' : 'md:hidden'
        )}
      >
        {/* Mobile always shows content here */}
        <motion.div
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, x: 16 }
          }
          animate={
            isInView
              ? { opacity: 1, x: 0 }
              : prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 16 }
          }
          transition={
            prefersReducedMotion
              ? instantTransition
              : { ...smoothTransition, delay: 0.1 }
          }
          className={cn(
            'max-w-sm rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 shadow-xs transition-shadow hover:shadow-sm',
            // Desktop: hide when this is a left-side event
            isLeft ? 'md:hidden' : ''
          )}
        >
          <TimelineCardContent event={event} />
        </motion.div>
      </div>

      {/* Desktop: show content on the left row for right-aligned events (placeholder for grid) */}
      {!isLeft && (
        <div className="hidden md:block col-start-1 row-start-1" />
      )}
    </div>
  );
}

function TimelineCardContent({ event }: { event: TimelineEvent }) {
  return (
    <>
      <div className="mb-1 flex items-center gap-2">
        <span className="font-heading text-sm font-semibold text-[hsl(var(--color-foreground))]">
          {event.title}
        </span>
      </div>
      {event.description && (
        <p className="mb-2 text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
          {event.description}
        </p>
      )}
      <div className="flex items-center gap-2">
        {event.actor && (
          <>
            <Avatar user={event.actor} size="sm" />
            <span className="text-xs text-[hsl(var(--color-foreground-muted))]">
              {event.actor.full_name}
            </span>
            <span className="text-[hsl(var(--color-neutral-300))]">
              &middot;
            </span>
          </>
        )}
        <time className="text-xs text-[hsl(var(--color-foreground-subtle))]">
          {relativeTime(event.timestamp)}
        </time>
      </div>
    </>
  );
}

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
        title="No timeline events"
        description="Activity will appear here as the project progresses."
      />
    );
  }

  return (
    <div className="py-2">
      {events.map((event, index) => (
        <TimelineItem
          key={event.id}
          event={event}
          index={index}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { portalUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>('updates');

  // Optimistic task state
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchProjectDetail(id);
      if (!result) {
        setError('Project not found');
        return;
      }
      setData(result);
      setOptimisticTasks(result.tasks);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscriptions
  useProjectRealtime(id, {
    onTaskChange: loadData,
    onUpdateChange: loadData,
    onTimelineChange: loadData,
  });

  // Optimistic task status change
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      // Optimistic update
      setOptimisticTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );

      try {
        await updateTaskStatus(taskId, newStatus);
      } catch (err) {
        // Revert on failure
        console.error('Failed to update task status:', err);
        if (data) {
          setOptimisticTasks(data.tasks);
        }
      }
    },
    [data]
  );

  // Sync optimistic tasks when data changes
  useEffect(() => {
    if (data) {
      setOptimisticTasks(data.tasks);
    }
  }, [data]);

  // Loading state
  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-background))]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothTransition}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--color-error-subtle))]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              stroke="hsl(var(--color-error))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="14" cy="14" r="12" />
              <path d="M14 9v6M14 19h.01" />
            </svg>
          </div>
          <h2 className="mb-2 font-heading text-lg font-semibold text-[hsl(var(--color-foreground))]">
            {error ?? 'Something went wrong'}
          </h2>
          <p className="mb-6 text-sm text-[hsl(var(--color-foreground-subtle))]">
            The project could not be loaded. Please try again.
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--color-primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--color-primary-foreground))] transition-colors hover:bg-[hsl(var(--color-primary-hover))]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M10 7H4M4 7l3-3M4 7l3 3" />
            </svg>
            Back to Portal
          </Link>
        </motion.div>
      </div>
    );
  }

  const { project, updates, team_members, timeline } = data;

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      {/* ================================================================
          BREADCRUMB HEADER
          ================================================================ */}
      <div className="border-b border-[hsl(var(--color-border))]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link
              href="/portal"
              className="text-[hsl(var(--color-foreground-subtle))] transition-colors hover:text-[hsl(var(--color-foreground))] min-h-0"
            >
              Portal
            </Link>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[hsl(var(--color-neutral-300))]"
            >
              <path d="M4.5 2.5l3 3.5-3 3.5" />
            </svg>
            <span className="font-medium text-[hsl(var(--color-foreground))]">
              {project.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ================================================================
            PROJECT HEADER
            ================================================================ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={prefersReducedMotion ? fadeIn : fadeUp}
          transition={prefersReducedMotion ? instantTransition : smoothTransition}
          className="mb-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: info */}
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] sm:text-3xl lg:text-4xl leading-[1.1]">
                  {project.name}
                </h1>
                <StatusPill status={project.status} />
              </div>

              {project.description && (
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))] sm:text-base">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--color-foreground-subtle))]">
                {/* Dates */}
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1.5" y="2" width="11" height="10.5" rx="1.5" />
                    <path d="M1.5 5.5h11" />
                    <path d="M4.5 1v2M9.5 1v2" />
                  </svg>
                  <span>
                    {formatDateRange(
                      project.start_date,
                      project.target_date
                    )}
                  </span>
                </div>

                {/* Team size */}
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="5" r="2.5" />
                    <path d="M2.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
                  </svg>
                  <span>
                    {team_members.length} member
                    {team_members.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Task progress */}
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1.5" y="2" width="11" height="10" rx="1.5" />
                    <path d="M4.5 7l2 2 3-3.5" />
                  </svg>
                  <span>
                    {optimisticTasks.filter((t) => t.status === 'done').length}/
                    {optimisticTasks.length} tasks done
                  </span>
                </div>
              </div>
            </div>

            {/* Right: progress ring + action */}
            <div className="flex items-center gap-5 lg:flex-col lg:items-end">
              <ProgressRing
                value={project.progress}
                size={72}
                strokeWidth={5}
                status={project.status}
              />
              <Link
                href={`/portal/projects/${id}/update`}
                className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--color-primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--color-primary-foreground))] shadow-sm transition-all hover:bg-[hsl(var(--color-primary-hover))] hover:shadow-md active:scale-[0.98]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M7 3v8M3 7h8" />
                </svg>
                New Update
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ================================================================
            TAB NAVIGATION
            ================================================================ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion
              ? instantTransition
              : { ...smoothTransition, delay: 0.15 }
          }
        >
          <div className="relative mb-8">
            {/* Scrollable tabs on mobile */}
            <div className="flex gap-0 overflow-x-auto border-b border-[hsl(var(--color-border))] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors min-h-[44px]',
                    activeTab === tab.id
                      ? 'text-[hsl(var(--color-foreground))]'
                      : 'text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]'
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <span className="opacity-60">{tab.icon}</span>
                  {tab.label}

                  {/* Active tab indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--color-foreground))]"
                      transition={
                        prefersReducedMotion
                          ? instantTransition
                          : {
                              type: 'spring',
                              stiffness: 500,
                              damping: 35,
                            }
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ================================================================
              TAB CONTENT
              ================================================================ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8 }
              }
              transition={
                prefersReducedMotion
                  ? instantTransition
                  : { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
              }
            >
              {activeTab === 'updates' && (
                <UpdatesTab updates={updates} />
              )}
              {activeTab === 'tasks' && (
                <TasksTab
                  tasks={optimisticTasks}
                  onStatusChange={handleTaskStatusChange}
                />
              )}
              {activeTab === 'team' && (
                <TeamTab members={team_members} />
              )}
              {activeTab === 'timeline' && (
                <TimelineTab events={timeline} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
