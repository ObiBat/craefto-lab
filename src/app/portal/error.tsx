'use client';

import { useEffect } from 'react';
import { portalDashboardPath } from '@/lib/portal/routes';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-background))] px-4">
      <div className="w-full max-w-md text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]">
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
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
          Something went wrong
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))]">
          {error.message || 'An unexpected error occurred. Please try again or return to the dashboard.'}
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
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
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Try again
          </button>

          <a
            href={portalDashboardPath()}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-6 py-2.5 text-sm font-medium text-[hsl(var(--color-foreground-muted))] transition-colors hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2"
          >
            Back to dashboard
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-[hsl(var(--color-foreground-subtle))]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
