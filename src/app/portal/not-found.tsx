import Link from 'next/link';
import { portalDashboardPath } from '@/lib/portal/routes';

export default function PortalNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-background))] px-4">
      <div className="w-full max-w-md text-center">
        {/* Decorative 404 */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-subtle))]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <p className="mb-2 font-[family-name:var(--font-sans)] text-sm font-medium uppercase tracking-widest text-[hsl(var(--color-foreground-subtle))]">
          404
        </p>

        <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
          Page not found
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href={portalDashboardPath()}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-foreground))] px-6 py-2.5 text-sm font-medium text-[hsl(var(--color-background))] transition-colors hover:bg-[hsl(var(--color-foreground)/0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
