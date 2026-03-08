'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/portal/auth-context';
import { fetchDashboardData } from '@/lib/portal/queries';
import { portalLoginPath, portalPath } from '@/lib/portal/routes';
import { ProjectCardV2 } from '@/components/portal/project-card-v2';
import { MessageButton } from '@/components/portal/message-button';
import { LogoStatic } from '@/components/ui/logo';
import type { DashboardData, Update } from '@/lib/portal/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const { portalUser, loading, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !portalUser) {
      router.replace(portalLoginPath());
    }
  }, [loading, portalUser, router]);

  useEffect(() => {
    if (!portalUser) return;
    fetchDashboardData()
      .then(setData)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [portalUser]);

  if (loading || !portalUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2D6A4F] border-t-transparent" />
      </div>
    );
  }

  const firstName = portalUser.full_name?.split(' ')[0] || 'there';
  const activeProjects = data?.projects.filter(p => p.status !== 'completed' && p.status !== 'paused') || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Top bar */}
      <header className="border-b" style={{ borderColor: '#F0EDE8' }}>
        <div className="mx-auto flex items-center justify-between px-6 py-4" style={{ maxWidth: 960 }}>
          <LogoStatic size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}>
              {portalUser.full_name}
            </span>
            <button
              onClick={() => signOut().then(() => router.replace(portalLoginPath()))}
              className="text-sm font-medium min-h-0 px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: '#6B6560', fontFamily: 'var(--font-heading)' }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto px-6 py-12"
        style={{ maxWidth: 960 }}
      >
        {/* Greeting */}
        <section className="mb-12">
          <h1
            className="text-[46px] font-bold leading-[1.1] tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: '#1A1A1A' }}
          >
            {getGreeting()}, {firstName}.
          </h1>
          <p
            className="mt-2 text-lg"
            style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}
          >
            {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}
            {data?.projects[0]?.updated_at && (
              <> &middot; Last updated {timeAgo(data.projects[0].updated_at)}</>
            )}
          </p>
        </section>

        {/* Project cards */}
        {fetching ? (
          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            {[0, 1].map(i => (
              <div key={i} className="h-64 rounded-2xl skeleton" />
            ))}
          </div>
        ) : data && data.projects.length > 0 ? (
          <section className="mb-12">
            <div className="grid gap-6 sm:grid-cols-2">
              {data.projects.map((project, i) => (
                <ProjectCardV2
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  status={project.status}
                  progress={project.progress}
                  description={project.description}
                  aiSummary={project.ai_summary}
                  nextMilestone={project.next_milestone}
                  nextMilestoneDate={project.next_milestone_date}
                  index={i}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-12 text-center py-16">
            <p style={{ color: '#6B6560', fontFamily: 'var(--font-serif)' }}>
              No projects yet.
            </p>
          </section>
        )}

        {/* Recent activity */}
        {data && data.recent_updates.length > 0 && (
          <section>
            <h3
              className="text-xl font-semibold mb-6"
              style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
            >
              Recent Activity
            </h3>
            <div className="space-y-0">
              {data.recent_updates.slice(0, 8).map((update: Update, i: number) => {
                const items = data.recent_updates.slice(0, 8);
                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link
                      href={update.project ? portalPath(`/projects/${update.project.id}`) : '#'}
                      className="flex items-start gap-4 py-4 transition-colors hover:bg-black/[0.02] -mx-3 px-3 rounded-lg min-h-0"
                      style={{ borderBottom: i < items.length - 1 ? '1px solid #F0EDE8' : 'none' }}
                    >
                      <span
                        className="shrink-0 text-sm tabular-nums mt-0.5"
                        style={{ color: '#6B6560', fontFamily: 'var(--font-heading)', minWidth: 72 }}
                      >
                        {timeAgo(update.created_at)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-base leading-relaxed"
                          style={{ fontFamily: 'var(--font-serif)', color: '#1A1A1A' }}
                        >
                          {update.title}
                        </p>
                      </div>
                      {update.project && (
                        <span
                          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: '#F0EDE8',
                            color: '#6B6560',
                            fontFamily: 'var(--font-heading)',
                          }}
                        >
                          {update.project.name}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </motion.main>

      <MessageButton />
    </div>
  );
}
