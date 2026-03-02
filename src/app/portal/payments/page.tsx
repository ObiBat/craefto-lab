'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AnimatedSection,
  AnimatedCounter,
  smoothTransition,
  instantTransition,
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
} from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { getMockInvoices } from '@/lib/portal/mock-data';
import { portalLoginPath } from '@/lib/portal/routes';
import type { Invoice, InvoiceStatus } from '@/lib/portal/types';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { InvoiceCard } from '@/components/portal/invoice-card';
import { EmptyState } from '@/components/portal/empty-state';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

const STATUS_FILTERS: { value: 'all' | InvoiceStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'draft', label: 'Draft' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaymentsPage() {
  const { portalUser, user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setInvoices(getMockInvoices());
    setLoading(false);
  }, []);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  // Summary stats
  const totalOutstanding = useMemo(
    () => invoices.filter((inv) => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    [invoices],
  );
  const totalPaid = useMemo(
    () => invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    [invoices],
  );
  const nextDueInvoice = useMemo(() => {
    const upcoming = invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return upcoming[0] ?? null;
  }, [invoices]);

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
            <div className="max-w-[1600px] mx-auto animate-pulse space-y-4">
              <div className="h-8 bg-[hsl(var(--color-background-muted))] rounded w-48" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-[hsl(var(--color-background-muted))] rounded-xl" />
                ))}
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
          breadcrumbs={[{ label: 'Payments' }]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="Payment portal">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <AnimatedSection variant="fadeUp" className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                Payments
              </h1>
              <p className="mt-1 text-sm text-[hsl(var(--color-foreground-muted))]">
                Invoice history, payment status, and outstanding balances.
              </p>
            </AnimatedSection>

            {/* Payment summary cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariant}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              aria-label="Payment summary"
            >
              {/* Outstanding */}
              <motion.div
                variants={itemVariant}
                transition={transition}
                className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))] mb-1">
                  Total Outstanding
                </p>
                <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] tabular-nums">
                  {formatCurrency(totalOutstanding)}
                </p>
              </motion.div>

              {/* Total Paid */}
              <motion.div
                variants={itemVariant}
                transition={transition}
                className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-success-subtle))] p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))] mb-1">
                  Total Paid
                </p>
                <p className="text-2xl font-semibold text-[hsl(var(--color-success))] font-[family-name:var(--font-heading)] tabular-nums">
                  {formatCurrency(totalPaid)}
                </p>
              </motion.div>

              {/* Next Due */}
              <motion.div
                variants={itemVariant}
                transition={transition}
                className={cn(
                  'rounded-xl border border-[hsl(var(--color-border))] p-5',
                  nextDueInvoice?.status === 'overdue'
                    ? 'bg-[hsl(var(--color-error-subtle))]'
                    : 'bg-[hsl(var(--color-background))]',
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))] mb-1">
                  Next Due
                </p>
                {nextDueInvoice ? (
                  <>
                    <p className={cn(
                      'text-2xl font-semibold font-[family-name:var(--font-heading)] tabular-nums',
                      nextDueInvoice.status === 'overdue'
                        ? 'text-[hsl(var(--color-error))]'
                        : 'text-[hsl(var(--color-foreground))]',
                    )}>
                      {formatCurrency(nextDueInvoice.amount)}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--color-foreground-subtle))] mt-0.5">
                      {nextDueInvoice.number} — due {new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric' }).format(new Date(nextDueInvoice.due_date))}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-[hsl(var(--color-success))]">All clear</p>
                )}
              </motion.div>
            </motion.div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] mb-6 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-fit" role="tablist" aria-label="Filter invoices by status">
              {STATUS_FILTERS.map((filter) => {
                const isSelected = statusFilter === filter.value;
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
                        layoutId="payment-filter"
                        className="absolute inset-0 rounded-full bg-[hsl(var(--color-foreground))]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Invoice list */}
            {filteredInvoices.length > 0 ? (
              <motion.div
                key={statusFilter}
                initial="hidden"
                animate="visible"
                variants={containerVariant}
                className="space-y-3"
              >
                {filteredInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    variants={itemVariant}
                    transition={{ ...transition, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  >
                    <InvoiceCard invoice={invoice} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                title="No invoices found"
                description={
                  statusFilter !== 'all'
                    ? `No invoices with "${STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}" status.`
                    : 'No invoices have been created yet.'
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
