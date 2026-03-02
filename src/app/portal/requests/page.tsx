'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AnimatedSection,
  smoothTransition,
  instantTransition,
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
} from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { getMockRequests } from '@/lib/portal/mock-data';
import { portalPath, portalLoginPath } from '@/lib/portal/routes';
import type { ClientRequest, RequestStatus } from '@/lib/portal/types';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { RequestCard } from '@/components/portal/request-card';
import { EmptyState } from '@/components/portal/empty-state';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

const STATUS_FILTERS: { value: 'all' | RequestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RequestsPage() {
  const { portalUser, user, loading: authLoading, signOut, isDemo} = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setRequests(getMockRequests());
    setLoading(false);
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const transition = prefersReducedMotion ? instantTransition : smoothTransition;
  const containerVariant = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariant = prefersReducedMotion ? reducedMotionVariants : staggerItem;

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen">
        <PortalSidebar userRole={portalUser?.role} />
        <div className="flex flex-1 flex-col min-w-0">
          <PortalHeader />
          <main className="flex-1 px-4 py-6 sm:p-6 md:p-8 lg:p-10" role="main">
            <div className="max-w-[1600px] mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-[hsl(var(--color-background-muted))] rounded w-48" />
                <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded" />
                <div className="h-32 bg-[hsl(var(--color-background-muted))] rounded" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userRole={portalUser?.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
          breadcrumbs={[{ label: 'Requests' }]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="Client requests">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <AnimatedSection variant="fadeUp" className="mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                    Requests
                  </h1>
                  <p className="mt-1 text-sm text-[hsl(var(--color-foreground-muted))]">
                    Submit change requests, feedback, questions, and bug reports.
                  </p>
                </div>
                <Link
                  href={portalPath('/requests/new')}
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--color-accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2"
                >
                  <PlusIcon />
                  New Request
                </Link>
              </div>
            </AnimatedSection>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] mb-6 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-fit" role="tablist" aria-label="Filter requests by status">
              {STATUS_FILTERS.map((filter) => {
                const isSelected = statusFilter === filter.value;
                const count = filter.value === 'all' ? requests.length : requests.filter((r) => r.status === filter.value).length;
                return (
                  <button
                    key={filter.value}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'relative shrink-0 whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 min-h-[36px]',
                      isSelected
                        ? 'text-[hsl(var(--color-background))]'
                        : 'text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]',
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="request-filter"
                        className="absolute inset-0 rounded-full bg-[hsl(var(--color-foreground))]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {filter.label}
                      {count > 0 && <span className="ml-1.5 opacity-60">({count})</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Request list */}
            {filteredRequests.length > 0 ? (
              <motion.div
                key={statusFilter}
                initial="hidden"
                animate="visible"
                variants={containerVariant}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    variants={itemVariant}
                    transition={{ ...transition, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  >
                    <RequestCard request={request} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                title="No requests found"
                description={
                  statusFilter !== 'all'
                    ? `No requests with "${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}" status.`
                    : 'You have not submitted any requests yet.'
                }
                action={
                  <Link
                    href={portalPath('/requests/new')}
                    className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--color-accent-hover))]"
                  >
                    <PlusIcon />
                    Submit a Request
                  </Link>
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
