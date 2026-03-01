"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { portalPath } from "@/lib/portal/routes";

// ---------------------------------------------------------------------------
// Portal Header — sticky, blurred, editorial top bar
// ---------------------------------------------------------------------------

/* ── Inline Chevron icon for breadcrumbs ─────────────────────────── */

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── LogOut icon ──────────────────────────────────────────────────── */

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1={21} x2={9} y1={12} y2={12} />
    </svg>
  );
}

/* ── Types ────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PortalHeaderUser {
  name: string;
  avatarUrl?: string;
}

export interface PortalHeaderProps {
  /** Current user info displayed on the right. */
  user?: PortalHeaderUser;
  /** Breadcrumb trail. The last item is treated as the current page. */
  breadcrumbs?: BreadcrumbItem[];
  /** Called when sign-out is clicked. */
  onSignOut?: () => void;
  className?: string;
}

/** Get initials from a name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (
    (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
  ).toUpperCase();
}

export function PortalHeader({
  user,
  breadcrumbs = [],
  onSignOut,
  className,
}: PortalHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full items-center border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-background)/.85)] px-4 backdrop-blur-lg sm:px-6 lg:px-8",
        className,
      )}
      role="banner"
    >
      <div className="flex w-full items-center justify-between gap-4">
        {/* ── Left: logo + breadcrumbs ─────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Wordmark */}
          <Link
            href={portalPath('/')}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 rounded-[var(--radius-sm)] min-h-0"
            aria-label="Back to portal dashboard"
          >
            <span className="font-heading text-base font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
              Cræfto
            </span>
          </Link>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={i}>
                    <ChevronRight className="text-[hsl(var(--color-foreground-subtle))]" />
                    {isLast || !crumb.href ? (
                      <span
                        className="truncate max-w-[180px] text-[hsl(var(--color-foreground-muted))] font-medium"
                        aria-current={isLast ? "page" : undefined}
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="truncate max-w-[180px] text-[hsl(var(--color-foreground-subtle))] transition-colors hover:text-[hsl(var(--color-foreground))] min-h-0"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Right: user + sign out ──────────────────────────── */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-xs font-semibold text-[hsl(var(--color-accent))]">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials(user.name)
                )}
              </span>
              <span className="hidden text-sm font-medium text-[hsl(var(--color-foreground))] sm:inline">
                {user.name}
              </span>
            </div>

            {/* Sign out */}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[hsl(var(--color-foreground-subtle))] transition-colors hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
                aria-label="Sign out"
              >
                <LogOutIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
