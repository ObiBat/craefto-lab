'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AnimatedCounter,
  AnimatedSection,
  smoothTransition,
  instantTransition,
  staggerContainer,
  staggerItem,
  fadeUp,
  fadeLeft,
  scaleIn,
  reducedMotionVariants,
} from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/portal/auth-context';
import { useRealtime } from '@/lib/portal/realtime';
import { fetchDashboardData } from '@/lib/portal/queries';
import type { DashboardData, ProjectFilter } from '@/lib/portal/types';

// Portal components (built separately)
import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { ProjectCard } from '@/components/portal/project-card';
import { ActivityItem } from '@/components/portal/activity-item';
import { SkeletonDashboard } from '@/components/portal/skeleton';

// =============================================================================
// CONSTANTS
// =============================================================================

const FILTER_OPTIONS: { value: ProjectFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'blocked', label: 'Blocked' },
];

const STATUS_CONFIG = {
  total: {
    label: 'Total Projects',
    color: 'text-[hsl(var(--color-foreground))]',
    bg: 'bg-[hsl(var(--color-background-subtle))]',
    iconBg: 'bg-[hsl(var(--color-neutral-200))]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4.5C3 3.67 3.67 3 4.5 3H8.5C9.33 3 10 3.67 10 4.5V8.5C10 9.33 9.33 10 8.5 10H4.5C3.67 10 3 9.33 3 8.5V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 11.5C10 10.67 10.67 10 11.5 10H15.5C16.33 10 17 10.67 17 11.5V15.5C17 16.33 16.33 17 15.5 17H11.5C10.67 17 10 16.33 10 15.5V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4.5C10 3.67 10.67 3 11.5 3H15.5C16.33 3 17 3.67 17 4.5V6.5C17 7.33 16.33 8 15.5 8H11.5C10.67 8 10 7.33 10 6.5V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 13.5C3 12.67 3.67 12 4.5 12H8.5C9.33 12 10 12.67 10 13.5V15.5C10 16.33 9.33 17 8.5 17H4.5C3.67 17 3 16.33 3 15.5V13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  on_track: {
    label: 'On Track',
    color: 'text-[hsl(var(--color-success))]',
    bg: 'bg-[hsl(var(--color-success-subtle))]',
    iconBg: 'bg-[hsl(var(--color-success))]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.67 5L7.5 14.17L3.33 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-[hsl(var(--color-warning))]',
    bg: 'bg-[hsl(var(--color-warning-subtle))]',
    iconBg: 'bg-[hsl(var(--color-warning))]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 7V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 13.5H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8.86 3.57L2.21 14.58C1.77 15.34 2.33 16.28 3.22 16.28H16.78C17.67 16.28 18.23 15.34 17.79 14.58L11.14 3.57C10.7 2.82 9.3 2.82 8.86 3.57Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  blocked: {
    label: 'Blocked',
    color: 'text-[hsl(var(--color-error))]',
    bg: 'bg-[hsl(var(--color-error-subtle))]',
    iconBg: 'bg-[hsl(var(--color-error))]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.05 14.95L14.95 5.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
} as const;

// =============================================================================
// GREETING HELPER
// =============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
  const { portalUser, loading: authLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------------------------------------------------------
  // Realtime subscriptions -- refetch on any change
  // ---------------------------------------------------------------------------

  const handleRealtimeChange = useCallback(() => {
    loadData();
  }, [loadData]);

  useRealtime({
    table: 'portal_projects',
    onInsert: handleRealtimeChange,
    onUpdate: handleRealtimeChange,
    onDelete: handleRealtimeChange,
  });

  useRealtime({
    table: 'portal_updates',
    onInsert: handleRealtimeChange,
    onUpdate: handleRealtimeChange,
    onDelete: handleRealtimeChange,
  });

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    if (activeFilter === 'all') return data.projects;
    return data.projects.filter((p) => p.status === activeFilter);
  }, [data, activeFilter]);

  const firstName = portalUser?.full_name?.split(' ')[0] ?? 'there';

  // ---------------------------------------------------------------------------
  // Transitions
  // ---------------------------------------------------------------------------

  const transition = prefersReducedMotion ? instantTransition : smoothTransition;
  const itemVariant = prefersReducedMotion ? reducedMotionVariants : staggerItem;
  const containerVariant = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const fadeUpVariant = prefersReducedMotion ? reducedMotionVariants : fadeUp;
  const fadeLeftVariant = prefersReducedMotion ? reducedMotionVariants : fadeLeft;
  const scaleInVariant = prefersReducedMotion ? reducedMotionVariants : scaleIn;

  // ---------------------------------------------------------------------------
  // Loading / skeleton
  // ---------------------------------------------------------------------------

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen">
        <PortalHeader />
        <PortalSidebar />
        <main className="flex-1 lg:ml-[240px] pt-16">
          <div className="p-6 md:p-8 lg:p-10">
            <SkeletonDashboard />
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen">
      {/* Fixed header */}
      <PortalHeader />

      {/* Sidebar */}
      <PortalSidebar />

      {/* Main content area */}
      <main className="flex-1 lg:ml-[240px] pt-16">
        <div className="p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
          {/* =================================================================
              WELCOME BANNER
              ================================================================= */}
          <AnimatedSection variant="fadeUp" className="mb-10">
            <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-8 md:p-10 shadow-sm">
              {/* Decorative background grain */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Subtle accent line at top */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[hsl(var(--color-accent)/0.3)] to-transparent" />

              <div className="relative">
                <p className="text-sm font-medium tracking-wide uppercase text-[hsl(var(--color-foreground-subtle))] mb-2 font-[family-name:var(--font-sans)]">
                  {getFormattedDate()}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.1] text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                  {getGreeting()},{' '}
                  <span className="text-[hsl(var(--color-accent))]">
                    {firstName}
                  </span>
                </h1>
                <p className="mt-3 text-base text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed">
                  Here is what is happening across your projects today. Stay informed, stay aligned.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* =================================================================
              STATS ROW
              ================================================================= */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariant}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {(
              [
                { key: 'total' as const, value: data?.stats.total_projects ?? 0 },
                { key: 'on_track' as const, value: data?.stats.on_track ?? 0 },
                { key: 'at_risk' as const, value: data?.stats.at_risk ?? 0 },
                { key: 'blocked' as const, value: data?.stats.blocked ?? 0 },
              ] as const
            ).map(({ key, value }) => {
              const config = STATUS_CONFIG[key];
              return (
                <motion.div
                  key={key}
                  variants={itemVariant}
                  transition={transition}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border border-[hsl(var(--color-border))] p-5 md:p-6 transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5',
                    config.bg,
                  )}
                >
                  {/* Subtle decorative corner */}
                  <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.04] bg-current" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))] mb-2">
                        {config.label}
                      </p>
                      <div className={cn('text-3xl md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-heading)]', config.color)}>
                        <AnimatedCounter value={value} duration={1.8} />
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110',
                        key === 'total'
                          ? 'bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-foreground-muted))]'
                          : key === 'on_track'
                            ? 'bg-[hsl(var(--color-success)/0.12)] text-[hsl(var(--color-success))]'
                            : key === 'at_risk'
                              ? 'bg-[hsl(var(--color-warning)/0.12)] text-[hsl(var(--color-warning))]'
                              : 'bg-[hsl(var(--color-error)/0.12)] text-[hsl(var(--color-error))]',
                      )}
                    >
                      {config.icon}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* =================================================================
              MAIN CONTENT: PROJECT GRID + ACTIVITY FEED
              ================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
            {/* ---------------------------------------------------------------
                LEFT: PROJECT GRID
                --------------------------------------------------------------- */}
            <div>
              {/* Filter bar */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariant}
                transition={{ ...transition, delay: 0.1 }}
                className="flex items-center justify-between mb-6"
              >
                <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                  Projects
                </h2>
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))]">
                  {FILTER_OPTIONS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      className={cn(
                        'relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 min-h-0',
                        activeFilter === filter.value
                          ? 'text-[hsl(var(--color-background))]'
                          : 'text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]',
                      )}
                    >
                      {activeFilter === filter.value && (
                        <motion.div
                          layoutId="active-filter"
                          className="absolute inset-0 rounded-full bg-[hsl(var(--color-foreground))]"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Project cards grid */}
              {filteredProjects.length > 0 ? (
                <motion.div
                  key={activeFilter}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariant}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      variants={itemVariant}
                      transition={{
                        ...(prefersReducedMotion ? instantTransition : smoothTransition),
                        delay: prefersReducedMotion ? 0 : index * 0.06,
                      }}
                      className={cn(
                        // Asymmetric layout: first card spans full width on md
                        index === 0 && filteredProjects.length > 2 && 'md:col-span-2',
                      )}
                    >
                      <ProjectCard
                        id={project.id}
                        name={project.name}
                        status={project.status}
                        progress={project.progress}
                        description={project.description ?? ''}
                        latestUpdate={project.latest_update?.title}
                        team={project.team_members?.map((tm) => ({
                          name: tm.user?.full_name ?? 'Unknown',
                          avatarUrl: tm.user?.avatar_url ?? undefined,
                        })) ?? []}
                        taskCount={project.task_count}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={scaleInVariant}
                  transition={transition}
                  className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle)/0.5)]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-background-muted))] flex items-center justify-center mb-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[hsl(var(--color-foreground-subtle))]"
                    >
                      <path
                        d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-[hsl(var(--color-foreground))] mb-1 font-[family-name:var(--font-heading)]">
                    No projects found
                  </h3>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))] text-center max-w-xs">
                    {activeFilter === 'all'
                      ? 'There are no projects to display yet.'
                      : `No projects with status "${FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label}" right now.`}
                  </p>
                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="mt-4 text-sm font-medium text-[hsl(var(--color-accent))] hover:underline underline-offset-4 min-h-0"
                    >
                      View all projects
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* ---------------------------------------------------------------
                RIGHT: ACTIVITY FEED
                --------------------------------------------------------------- */}
            <motion.aside
              initial="hidden"
              animate="visible"
              variants={fadeLeftVariant}
              transition={{ ...transition, delay: 0.3 }}
              className="xl:sticky xl:top-24 xl:self-start"
            >
              <div className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] overflow-hidden shadow-xs">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[hsl(var(--color-border))]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                      Recent Activity
                    </h2>
                    <span className="text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))] bg-[hsl(var(--color-background-subtle))] px-2 py-0.5 rounded-full">
                      {data?.recent_updates.length ?? 0} updates
                    </span>
                  </div>
                </div>

                {/* Activity list */}
                <div className="divide-y divide-[hsl(var(--color-border-subtle))]">
                  {data?.recent_updates && data.recent_updates.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariant}
                    >
                      {data.recent_updates.slice(0, 10).map((update) => (
                        <motion.div
                          key={update.id}
                          variants={itemVariant}
                          transition={transition}
                        >
                          <ActivityItem
                            type={update.type as 'alignment' | 'decision' | 'blocker' | 'milestone' | 'task_update'}
                            title={update.title}
                            author={update.author?.full_name ?? 'Unknown'}
                            timestamp={update.created_at}
                            projectName={update.project?.name ?? 'Unknown Project'}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>
    </div>
  );
}
