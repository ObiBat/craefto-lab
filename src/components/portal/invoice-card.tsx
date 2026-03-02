'use client';

import { cn } from '@/lib/utils';
import type { Invoice } from '@/lib/portal/types';

// ---------------------------------------------------------------------------
// Invoice Card — displays a single invoice in a list
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-700))]', dotColor: 'bg-[hsl(var(--color-neutral-400))]' },
  sent: { label: 'Sent', color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]', dotColor: 'bg-[hsl(var(--color-accent))]' },
  paid: { label: 'Paid', color: 'bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]', dotColor: 'bg-[hsl(var(--color-success))]' },
  overdue: { label: 'Overdue', color: 'bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]', dotColor: 'bg-[hsl(var(--color-error))]' },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1={12} x2={12} y1={15} y2={3} />
    </svg>
  );
}

function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export interface InvoiceCardProps {
  invoice: Invoice;
  className?: string;
}

export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  const statusConfig = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.draft;
  const showPayButton = invoice.status === 'sent' || invoice.status === 'overdue';

  return (
    <div
      className={cn(
        'rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 sm:p-5 transition-all duration-200',
        'hover:shadow-sm hover:border-[hsl(var(--color-border-strong))]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
              {invoice.number}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', statusConfig.color)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotColor)} aria-hidden="true" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-2 line-clamp-1">
            {invoice.description}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[hsl(var(--color-foreground-subtle))]">
            {invoice.project && <span>{invoice.project.name}</span>}
            <span>Due {formatDate(invoice.due_date)}</span>
            {invoice.paid_at && <span>Paid {formatDate(invoice.paid_at)}</span>}
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] tabular-nums">
            {formatCurrency(invoice.amount)}
          </p>
          <div className="flex items-center gap-2 mt-2 justify-end">
            {showPayButton && invoice.stripe_checkout_url && (
              <a
                href={invoice.stripe_checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-colors',
                  invoice.status === 'overdue'
                    ? 'bg-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error)/.85)]'
                    : 'bg-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent-hover))]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
                )}
              >
                <ExternalLinkIcon />
                Pay Now
              </a>
            )}
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--color-foreground-subtle))] hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
              aria-label={`Download ${invoice.number}`}
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
