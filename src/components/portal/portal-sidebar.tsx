"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { portalPath } from "@/lib/portal/routes";

// ---------------------------------------------------------------------------
// Portal Sidebar — collapsible navigation with expandable project list
// ---------------------------------------------------------------------------

/* ── Inline SVG icons (18 x 18) ──────────────────────────────────── */

function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width={7} height={9} x={3} y={3} rx={1} />
      <rect width={7} height={5} x={14} y={3} rx={1} />
      <rect width={7} height={9} x={14} y={12} rx={1} />
      <rect width={7} height={5} x={3} y={16} rx={1} />
    </svg>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <line x1={4} x2={20} y1={12} y2={12} />
      <line x1={4} x2={20} y1={6} y2={6} />
      <line x1={4} x2={20} y1={18} y2={18} />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 13H8" />
      <path d="M16 17H8" />
      <path d="M16 13h-2" />
    </svg>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width={20} height={14} x={2} y={5} rx={2} />
      <line x1={2} x2={22} y1={10} y2={10} />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

/* ── Types ────────────────────────────────────────────────────────── */

import type { UserRole } from "@/lib/portal/types";

export interface SidebarProject {
  id: string;
  name: string;
}

export interface PortalSidebarProps {
  /** Project list shown under the expandable "Projects" section. */
  projects?: SidebarProject[];
  /** Callback when "New Update" CTA is clicked. */
  onNewUpdate?: () => void;
  /** Hide the "New Update" button (e.g. for stakeholder role). */
  hideNewUpdate?: boolean;
  /** Current user role — controls which nav items are visible. */
  userRole?: UserRole;
  className?: string;
}

/* ── Component ───────────────────────────────────────────────────── */

export function PortalSidebar({
  projects = [],
  onNewUpdate,
  hideNewUpdate = false,
  userRole,
  className,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [projectsExpanded, setProjectsExpanded] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isDashboardActive =
    pathname === "/portal" || pathname === "/portal/" || pathname === "/";
  const isProjectsActive = pathname?.startsWith("/portal/projects") || pathname?.startsWith("/projects");
  const isRequestsActive = pathname?.startsWith("/portal/requests");
  const isDocumentsActive = pathname?.startsWith("/portal/documents");
  const isPaymentsActive = pathname?.startsWith("/portal/payments");
  const isSettingsActive = pathname?.startsWith("/portal/settings");

  // All roles can see Projects; stakeholder sees Requests, Documents, Payments;
  // Admin/PM see everything including those sections
  const showStakeholderNav = userRole === 'stakeholder' || userRole === 'admin' || userRole === 'project_manager';

  const isProjectActive = (projectId: string) =>
    pathname === `/portal/projects/${projectId}` ||
    pathname?.startsWith(`/portal/projects/${projectId}/`) ||
    pathname === `/projects/${projectId}` ||
    pathname?.startsWith(`/projects/${projectId}/`);

  /* Shared nav content (rendered in both desktop + mobile) */
  const NavContent = (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Portal navigation">
        {/* Dashboard link */}
        <Link
          href={portalPath('/')}
          className={cn(
            "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
            isDashboardActive
              ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
              : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
          )}
          aria-current={isDashboardActive ? "page" : undefined}
        >
          <LayoutDashboardIcon />
          Dashboard
        </Link>

        {/* Projects — expandable */}
        <div>
          <button
            type="button"
            onClick={() => setProjectsExpanded((prev) => !prev)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              isProjectsActive
                ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
                : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
            )}
            aria-expanded={projectsExpanded}
          >
            <FolderIcon />
            <span className="flex-1 text-left">Projects</span>
            <motion.span
              animate={{ rotate: projectsExpanded ? 180 : 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: "easeInOut" }
              }
            >
              <ChevronDownIcon />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {projectsExpanded && projects.length > 0 && (
              <motion.ul
                initial={prefersReducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                }
                className="overflow-hidden"
                role="list"
              >
                {projects.map((project) => {
                  const active = isProjectActive(project.id);
                  return (
                    <li key={project.id}>
                      <Link
                        href={portalPath(`/projects/${project.id}`)}
                        className={cn(
                          "block truncate rounded-[var(--radius-sm)] py-2.5 pl-11 pr-3 text-[13px] transition-colors min-h-[44px] flex items-center",
                          active
                            ? "font-medium text-[hsl(var(--color-accent))]"
                            : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))]",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {project.name}
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* ── Stakeholder / shared nav items ────────────────── */}
        {showStakeholderNav && (
          <>
            <div className="mx-3 my-2 h-px bg-[hsl(var(--color-border))]" role="separator" />

            <Link
              href={portalPath('/requests')}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                isRequestsActive
                  ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
                  : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
              )}
              aria-current={isRequestsActive ? "page" : undefined}
            >
              <MessageSquareIcon />
              Requests
            </Link>

            <Link
              href={portalPath('/documents')}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                isDocumentsActive
                  ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
                  : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
              )}
              aria-current={isDocumentsActive ? "page" : undefined}
            >
              <FileTextIcon />
              Documents
            </Link>

            <Link
              href={portalPath('/payments')}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                isPaymentsActive
                  ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
                  : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
              )}
              aria-current={isPaymentsActive ? "page" : undefined}
            >
              <CreditCardIcon />
              Payments
            </Link>
          </>
        )}

        {/* Settings — visible to all roles */}
        <div className="mx-3 my-2 h-px bg-[hsl(var(--color-border))]" role="separator" />

        <Link
          href={portalPath('/settings')}
          className={cn(
            "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
            isSettingsActive
              ? "border-l-2 border-l-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]"
              : "text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
          )}
          aria-current={isSettingsActive ? "page" : undefined}
        >
          <SettingsIcon />
          Settings
        </Link>
      </nav>

      {/* CTA: New Update — hidden for stakeholder role */}
      {onNewUpdate && !hideNewUpdate && (
        <div className="border-t border-[hsl(var(--color-border))] p-4">
          <button
            type="button"
            onClick={onNewUpdate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--color-accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 min-h-0"
          >
            <PlusIcon />
            New Update
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Mobile toggle ────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="fixed top-3 right-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] shadow-sm lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        {mobileOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* ── Mobile overlay + drawer ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              {NavContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-[hsl(var(--color-border))] lg:bg-[hsl(var(--color-background))]",
          className,
        )}
        aria-label="Portal navigation"
      >
        {NavContent}
      </aside>
    </>
  );
}
