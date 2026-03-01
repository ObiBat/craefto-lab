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
  /** Portal role — displayed as a badge next to the name. */
  role?: string;
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
        <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
          {/* Wordmark as first breadcrumb */}
          <Link
            href={portalPath('/')}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-[hsl(var(--color-background-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 min-h-0"
            aria-label="Back to portal dashboard"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-[hsl(var(--color-foreground))]" />
              <path d="M6 6h2v6H6zM10 6h2v6h-2z" fill="currentColor" className="text-[hsl(var(--color-foreground))]" />
            </svg>
            <span className="font-heading text-[13px] font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
              Portal
            </span>
          </Link>

          {/* Breadcrumb items */}
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                <ChevronRight className="flex-shrink-0 text-[hsl(var(--color-neutral-300))]" />
                {isLast || !crumb.href ? (
                  <span
                    className="truncate max-w-[220px] text-[13px] font-medium text-[hsl(var(--color-foreground))]"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate max-w-[220px] rounded-md px-1.5 py-1 text-[13px] text-[hsl(var(--color-foreground-muted))] transition-colors hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))] min-h-0"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>

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
              {user.role && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-[hsl(var(--color-background-subtle))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--color-foreground-muted))] border border-[hsl(var(--color-border))]">
                  {user.role}
                </span>
              )}
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
