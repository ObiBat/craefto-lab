'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { getMockProjects } from '@/lib/portal/mock-data';
import { portalPath, portalLoginPath } from '@/lib/portal/routes';
import { useToast } from '@/components/portal/toast';
import type { RequestType, RequestPriority, Project } from '@/lib/portal/types';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';

// ---------------------------------------------------------------------------
// Form config
// ---------------------------------------------------------------------------

const REQUEST_TYPES: { value: RequestType; label: string; description: string }[] = [
  { value: 'change_request', label: 'Change Request', description: 'Request a modification to existing work' },
  { value: 'feedback', label: 'Feedback', description: 'Share thoughts or suggestions' },
  { value: 'question', label: 'Question', description: 'Ask about something' },
  { value: 'bug_report', label: 'Bug Report', description: 'Report something that is broken' },
  { value: 'feature_request', label: 'Feature Request', description: 'Suggest a new feature or enhancement' },
];

const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
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
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewRequestPage() {
  const { portalUser, user, loading: authLoading, signOut, isDemo} = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequestType>('feedback');
  const [priority, setPriority] = useState<RequestPriority>('medium');

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const p = getMockProjects().filter((proj) => proj.status !== 'completed');
    setProjects(p);
    if (p.length > 0) setProjectId(p[0].id);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !description.trim() || !projectId) return;

      setSubmitting(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast('success', 'Request submitted successfully');
      router.push(portalPath('/requests'));
    },
    [title, description, projectId, toast, router],
  );

  const inputClass =
    'w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-3.5 py-2.5 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-foreground-subtle))] transition-colors focus:border-[hsl(var(--color-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]';

  const labelClass = 'block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5';

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userRole={portalUser?.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
          breadcrumbs={[
            { label: 'Requests', href: portalPath('/requests') },
            { label: 'New Request' },
          ]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="New request form">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-2xl mx-auto">
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
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] mb-2">
                New Request
              </h1>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-8">
                Submit a change request, feedback, question, or bug report to the team.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project */}
                <div>
                  <label htmlFor="project" className={labelClass}>
                    Project
                  </label>
                  <select
                    id="project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={inputClass}
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Request type */}
                <div>
                  <label className={labelClass}>Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REQUEST_TYPES.map((rt) => (
                      <button
                        key={rt.value}
                        type="button"
                        onClick={() => setType(rt.value)}
                        className={cn(
                          'flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors',
                          type === rt.value
                            ? 'border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))]'
                            : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]',
                        )}
                        aria-pressed={type === rt.value}
                      >
                        <span className={cn(
                          'text-xs font-semibold',
                          type === rt.value
                            ? 'text-[hsl(var(--color-accent))]'
                            : 'text-[hsl(var(--color-foreground))]',
                        )}>
                          {rt.label}
                        </span>
                        <span className="text-[11px] text-[hsl(var(--color-foreground-subtle))] mt-0.5">
                          {rt.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className={labelClass}>
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequestPriority)}
                    className={inputClass}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your request"
                    className={inputClass}
                    required
                    maxLength={200}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your request..."
                    className={cn(inputClass, 'min-h-[160px] resize-y')}
                    required
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !description.trim()}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-accent))] px-5 py-2.5 text-sm font-medium text-white transition-colors',
                      'hover:bg-[hsl(var(--color-accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    <SendIcon />
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(portalPath('/requests'))}
                    className="text-sm font-medium text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
