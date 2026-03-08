'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { getMockRequest } from '@/lib/portal/mock-data';
import { portalPath, portalLoginPath } from '@/lib/portal/routes';
import { useToast } from '@/components/portal/toast';
import type { ClientRequest, RequestStatus } from '@/lib/portal/types';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';

// ---------------------------------------------------------------------------
// Config maps
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

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function PaperclipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RequestDetailPage() {
  const { portalUser, user, loading: authLoading, signOut, hasPermission, isDemo} = useAuth();
  const router = useRouter();
  const params = useParams();
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const requestId = params.id as string;
  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState<RequestStatus>('pending');

  const canManage = hasPermission('create_update'); // admin, PM, team members

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const req = getMockRequest(requestId);
    setRequest(req);
    if (req) setStatus(req.status);
    setLoading(false);
  }, [requestId]);

  const handleStatusChange = useCallback(
    (newStatus: RequestStatus) => {
      setStatus(newStatus);
      if (request) {
        setRequest({ ...request, status: newStatus });
      }
      toast('success', `Status updated to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
    },
    [request, toast],
  );

  const handleReply = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || !request || !portalUser) return;
      const newReply = {
        id: `reply-${Date.now()}`,
        request_id: request.id,
        author_id: portalUser.id,
        content: replyText.trim(),
        created_at: new Date().toISOString(),
        author: portalUser,
      };
      setRequest({
        ...request,
        replies: [...(request.replies ?? []), newReply],
      });
      setReplyText('');
      toast('success', 'Reply sent');
    },
    [replyText, request, portalUser, toast],
  );

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen">
        <PortalSidebar userRole={portalUser?.role} />
        <div className="flex flex-1 flex-col min-w-0">
          <PortalHeader />
          <main className="flex-1 px-4 py-6 sm:p-6 md:p-8 lg:p-10" role="main">
            <div className="max-w-3xl mx-auto animate-pulse space-y-4">
              <div className="h-8 bg-[hsl(var(--color-background-muted))] rounded w-64" />
              <div className="h-48 bg-[hsl(var(--color-background-muted))] rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen">
        <PortalSidebar userRole={portalUser?.role} />
        <div className="flex flex-1 flex-col min-w-0">
          <PortalHeader
            user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
            breadcrumbs={[{ label: 'Requests', href: portalPath('/requests') }, { label: 'Not Found' }]}
            onSignOut={signOut}
          />
          <main className="flex-1 flex items-center justify-center" role="main">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-[hsl(var(--color-foreground))]">Request not found</h1>
              <button
                onClick={() => router.push(portalPath('/requests'))}
                className="mt-4 text-sm font-medium text-[hsl(var(--color-accent))] hover:underline"
              >
                Back to Requests
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[request.type] ?? TYPE_CONFIG.question;
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[request.priority] ?? PRIORITY_CONFIG.low;

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userRole={portalUser?.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
          breadcrumbs={[
            { label: 'Requests', href: portalPath('/requests') },
            { label: request.title },
          ]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="Request detail">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-3xl mx-auto">
            {/* Back link */}
            <button
              type="button"
              onClick={() => router.push(portalPath('/requests'))}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors mb-6"
            >
              <ArrowLeftIcon />
              Back to Requests
            </button>

            <AnimatedSection variant="fadeUp">
              {/* Header card */}
              <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-5 sm:p-6 mb-6">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig.dot)} aria-hidden="true" />
                    {priorityConfig.label} priority
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] mb-3">
                  {request.title}
                </h1>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-foreground-subtle))] mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-[9px] font-bold text-[hsl(var(--color-accent))]">
                      {initials(request.author?.full_name ?? 'U')}
                    </span>
                    {request.author?.full_name}
                  </span>
                  <span>{formatDate(request.created_at)}</span>
                  {request.project && (
                    <span className="hidden sm:inline">{request.project.name}</span>
                  )}
                </div>

                {/* Description */}
                <div
                  className="prose prose-sm max-w-none text-[hsl(var(--color-foreground-muted))] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_code]:bg-[hsl(var(--color-background-muted))] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                  dangerouslySetInnerHTML={{ __html: request.description }}
                />

                {/* Attachments */}
                {request.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
                    <p className="text-xs font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {request.attachments.map((att) => (
                        <span
                          key={att.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] px-3 py-1.5 text-xs"
                        >
                          <PaperclipIcon />
                          <span className="font-medium text-[hsl(var(--color-foreground))]">{att.name}</span>
                          <span className="text-[hsl(var(--color-foreground-subtle))]">({formatFileSize(att.size)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin/PM status change */}
                {canManage && (
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
                    <label htmlFor="status-select" className="text-xs font-medium text-[hsl(var(--color-foreground-subtle))] mb-1.5 block">
                      Update Status
                    </label>
                    <select
                      id="status-select"
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value as RequestStatus)}
                      className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-3 py-2 text-sm text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Conversation thread */}
              <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] overflow-hidden">
                <div className="px-5 py-4 border-b border-[hsl(var(--color-border))]">
                  <h2 className="text-sm font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                    Conversation
                    {(request.replies?.length ?? 0) > 0 && (
                      <span className="ml-1.5 text-[hsl(var(--color-foreground-subtle))] font-normal">
                        ({request.replies?.length})
                      </span>
                    )}
                  </h2>
                </div>

                {/* Replies */}
                <div className="divide-y divide-[hsl(var(--color-border))]">
                  {request.replies && request.replies.length > 0 ? (
                    <AnimatePresence initial={false}>
                      {request.replies.map((reply) => (
                        <motion.div
                          key={reply.id}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                          className="px-5 py-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-[10px] font-bold text-[hsl(var(--color-accent))]">
                              {initials(reply.author?.full_name ?? 'U')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                                  {reply.author?.full_name ?? 'Unknown'}
                                </span>
                                <span className="text-[11px] text-[hsl(var(--color-foreground-subtle))]">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">No replies yet</p>
                    </div>
                  )}
                </div>

                {/* Reply form */}
                <div className="border-t border-[hsl(var(--color-border))] px-5 py-4">
                  <form onSubmit={handleReply} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label htmlFor="reply-input" className="sr-only">
                        Write a reply
                      </label>
                      <textarea
                        id="reply-input"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-3.5 py-2.5 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-foreground-subtle))] transition-colors focus:border-[hsl(var(--color-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-medium text-white transition-colors',
                        'hover:bg-[hsl(var(--color-accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                    >
                      <SendIcon />
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
