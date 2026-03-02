'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { portalPath } from '@/lib/portal/routes';
import type { ClientRequest } from '@/lib/portal/types';

// ---------------------------------------------------------------------------
// Request Card — displays a single client request in a list
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  change_request: { label: 'Change Request', color: 'bg-[hsl(var(--color-warning-subtle))] text-[hsl(var(--color-warning))]' },
  feedback: { label: 'Feedback', color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]' },
  question: { label: 'Question', color: 'bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-700))]' },
  bug_report: { label: 'Bug Report', color: 'bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]' },
  feature_request: { label: 'Feature Request', color: 'bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-700))]' },
  in_review: { label: 'In Review', color: 'bg-[hsl(var(--color-warning-subtle))] text-[hsl(var(--color-warning))]' },
  approved: { label: 'Approved', color: 'bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]' },
  rejected: { label: 'Rejected', color: 'bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]' },
  completed: { label: 'Completed', color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]' },
};

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  low: { label: 'Low', dot: 'bg-[hsl(var(--color-neutral-400))]' },
  medium: { label: 'Medium', dot: 'bg-[hsl(var(--color-warning))]' },
  high: { label: 'High', dot: 'bg-[hsl(var(--color-error))]' },
  urgent: { label: 'Urgent', dot: 'bg-[hsl(var(--color-error))]' },
};

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={12} cy={12} r={10} />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PaperclipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric' }).format(new Date(dateStr));
}

export interface RequestCardProps {
  request: ClientRequest;
  className?: string;
}

export function RequestCard({ request, className }: RequestCardProps) {
  const typeConfig = TYPE_CONFIG[request.type] ?? TYPE_CONFIG.question;
  const statusConfig = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[request.priority] ?? PRIORITY_CONFIG.low;
  const replyCount = request.replies?.length ?? 0;
  const attachmentCount = request.attachments.length;

  return (
    <Link
      href={portalPath(`/requests/${request.id}`)}
      className={cn(
        'block rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 sm:p-5 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-[hsl(var(--color-border-strong))]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
        className,
      )}
    >
      {/* Top row: type badge + status + priority */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', typeConfig.color)}>
          {typeConfig.label}
        </span>
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusConfig.color)}>
          {statusConfig.label}
        </span>
        {request.priority !== 'low' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))]">
            <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig.dot)} aria-hidden="true" />
            {priorityConfig.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))] leading-snug mb-1.5 line-clamp-2">
        {request.title}
      </h3>

      {/* Project name */}
      {request.project && (
        <p className="text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))] mb-3">
          {request.project.name}
        </p>
      )}

      {/* Bottom metadata row */}
      <div className="flex items-center gap-3 text-[11px] text-[hsl(var(--color-foreground-subtle))]">
        <span className="inline-flex items-center gap-1">
          <ClockIcon />
          {relativeTime(request.created_at)}
        </span>
        {replyCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageIcon />
            {replyCount}
          </span>
        )}
        {attachmentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <PaperclipIcon />
            {attachmentCount}
          </span>
        )}
        <span className="ml-auto text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))]">
          {request.author?.full_name ?? 'Unknown'}
        </span>
      </div>
    </Link>
  );
}
