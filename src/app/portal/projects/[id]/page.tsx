'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/portal/auth-context';
import { fetchProjectDetail, fetchProjectWithLinear } from '@/lib/portal/queries';
import { portalPath, portalLoginPath } from '@/lib/portal/routes';
import { MilestoneTimeline } from '@/components/portal/milestone-timeline';
import { MessageButton } from '@/components/portal/message-button';
import type {
  ProjectDetailData,
  Task,
  Update,
  Invoice,
  InvoiceStatus,
  LinearTask,
  LinearMilestone,
  ProjectStatus,
} from '@/lib/portal/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<ProjectStatus, string> = {
  on_track: '#2D6A4F',
  at_risk: '#D4A843',
  blocked: '#C1553B',
  completed: '#8B9E93',
  paused: '#8B9E93',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  blocked: 'Blocked',
  completed: 'Completed',
  paused: 'Paused',
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#6B6560',
  sent: '#D4A843',
  paid: '#2D6A4F',
  overdue: '#C1553B',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TaskIcon({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#2D6A4F" />
        <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'in_progress' || status === 'in_review') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#2D6A4F" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 0 20" fill="#2D6A4F" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#8B9E93" strokeWidth="2" />
    </svg>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { portalUser, loading } = useAuth();
  const projectId = params.id as string;

  const [detail, setDetail] = useState<ProjectDetailData | null>(null);
  const [linearTasks, setLinearTasks] = useState<LinearTask[]>([]);
  const [milestones, setMilestones] = useState<LinearMilestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !portalUser) {
      router.replace(portalLoginPath());
    }
  }, [loading, portalUser, router]);

  useEffect(() => {
    if (!portalUser || !projectId) return;

    Promise.all([
      fetchProjectDetail(projectId),
      fetchProjectWithLinear(projectId),
    ])
      .then(([detailData, linearData]) => {
        setDetail(detailData);
        if (linearData) {
          setLinearTasks(linearData.tasks);
          setMilestones(linearData.milestones);
        }
        // Fetch invoices
        import('@/lib/portal/supabase-auth').then(({ createBrowserClient }) => {
          const supabase = createBrowserClient();
          supabase
            .from('portal_invoices')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) setInvoices(data as Invoice[]);
            });
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [portalUser, projectId]);

  if (loading || !portalUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2D6A4F] border-t-transparent" />
      </div>
    );
  }

  if (!fetching && !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}>Project not found.</p>
        <Link
          href={portalPath('/')}
          className="text-sm font-medium min-h-0"
          style={{ color: '#2D6A4F', fontFamily: 'var(--font-heading)' }}
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  if (fetching || !detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2D6A4F] border-t-transparent" />
      </div>
    );
  }

  const { project, updates, tasks } = detail;
  const statusColor = STATUS_COLORS[project.status];

  // Merge portal tasks + linear tasks for display
  const allTasks = linearTasks.length > 0 ? linearTasks : tasks;
  const doneTasks = linearTasks.length > 0
    ? linearTasks.filter(t => t.status === 'done' || t.status === 'completed' || t.status === 'Done' || t.status === 'Completed')
    : tasks.filter(t => t.status === 'done');
  const totalTasks = allTasks.length;
  const completedTasks = doneTasks.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto px-6 py-12"
        style={{ maxWidth: 960 }}
      >
        {/* Back link */}
        <Link
          href={portalPath('/')}
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 min-h-0 transition-colors hover:opacity-70"
          style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Projects
        </Link>

        {/* Header */}
        <section className="mb-12">
          <h1
            className="text-[46px] font-bold leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: '#1A1A1A' }}
          >
            {project.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              {(project.status === 'on_track' || project.status === 'at_risk') && (
                <motion.span
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{ backgroundColor: statusColor }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <span className="relative inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: statusColor }} />
            </span>
            <span className="text-sm font-medium" style={{ color: statusColor, fontFamily: 'var(--font-heading)' }}>
              {STATUS_LABELS[project.status]}
            </span>
            <span className="text-sm" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>
              &middot; {project.progress}% complete
            </span>
          </div>

          {project.ai_summary && (
            <p
              className="text-lg italic leading-[1.75]"
              style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}
            >
              {project.ai_summary}
            </p>
          )}
        </section>

        {/* Timeline */}
        {milestones.length > 0 && (
          <section className="mb-12">
            <MilestoneTimeline
              milestones={milestones.map(m => ({
                name: m.name,
                date: m.targetDate,
                status: m.status,
              }))}
            />
          </section>
        )}

        {/* Current Sprint */}
        <section className="mb-12">
          <h3
            className="text-xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
          >
            {"What's Happening Now"}
          </h3>

          {totalTasks > 0 ? (
            <>
              <p className="text-sm mb-4" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>
                {completedTasks} of {totalTasks} tasks complete
              </p>
              <div className="space-y-2">
                {(linearTasks.length > 0 ? linearTasks : tasks).map((task: LinearTask | Task) => {
                  const taskStatus = 'status' in task ? task.status : 'todo';
                  const isDone = taskStatus === 'done' || taskStatus === 'Done' || taskStatus === 'completed' || taskStatus === 'Completed';
                  const isInProgress = taskStatus === 'in_progress' || taskStatus === 'In Progress' || taskStatus === 'in_review' || taskStatus === 'In Review';
                  const resolvedStatus = isDone ? 'done' : isInProgress ? 'in_progress' : 'todo';

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg"
                      style={{ backgroundColor: isDone ? '#f9f9f7' : 'transparent' }}
                    >
                      <TaskIcon status={resolvedStatus} />
                      <span
                        className="text-base"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          color: isDone ? '#8B9E93' : '#1A1A1A',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-base" style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}>
              Connect to Linear to see live tasks
            </p>
          )}
        </section>

        {/* Files */}
        <section className="mb-12">
          <h3
            className="text-xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
          >
            Files
          </h3>
          {project.google_drive_url ? (
            <a
              href={project.google_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium min-h-0 transition-colors hover:opacity-70"
              style={{ color: '#2D6A4F', fontFamily: 'var(--font-heading)' }}
            >
              Open in Google Drive
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          ) : (
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)', color: '#6B6560' }}>
              No files linked yet
            </p>
          )}
        </section>

        {/* Updates */}
        {updates.length > 0 && (
          <section className="mb-12">
            <h3
              className="text-xl font-semibold mb-6"
              style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
            >
              Updates
            </h3>
            <div className="space-y-4">
              {updates.map((update: Update, i: number) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border bg-white p-6"
                  style={{ borderColor: '#F0EDE8' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>
                      {new Date(update.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: '#1A1A1A' }}
                  >
                    {update.title}
                  </h4>
                  <div
                    className="text-base leading-[1.75] prose prose-sm max-w-none"
                    style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}
                    dangerouslySetInnerHTML={{ __html: update.content }}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Invoices */}
        <section className="mb-12">
          <h3
            className="text-xl font-semibold mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
          >
            Invoices
          </h3>

          {invoices.length > 0 ? (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#F0EDE8' }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: '#FAF9F6' }}>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>Number</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>Amount</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide hidden sm:table-cell" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>Description</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-right" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: Invoice) => (
                    <tr key={invoice.id} className="border-t" style={{ borderColor: '#F0EDE8' }}>
                      <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
                        {invoice.number}
                      </td>
                      <td className="px-6 py-4 text-sm tabular-nums" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm hidden sm:table-cell" style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}>
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                          style={{
                            color: INVOICE_STATUS_COLORS[invoice.status],
                            backgroundColor: `${INVOICE_STATUS_COLORS[invoice.status]}15`,
                            fontFamily: 'var(--font-heading)',
                          }}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)', color: '#6B6560' }}>
              No invoices yet
            </p>
          )}
        </section>
      </motion.main>

      <MessageButton />
    </div>
  );
}
