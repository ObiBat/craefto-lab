"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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

/* ── Types ────────────────────────────────────────────────────────── */

export interface SidebarProject {
  id: string;
  name: string;
}

export interface PortalSidebarProps {
  /** Project list shown under the expandable "Projects" section. */
  projects?: SidebarProject[];
  /** Callback when "New Update" CTA is clicked. */
  onNewUpdate?: () => void;
  className?: string;
}

/* ── Component ───────────────────────────────────────────────────── */

export function PortalSidebar({
  projects = [],
  onNewUpdate,
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
    pathname === "/portal" || pathname === "/portal/";
  const isProjectsActive = pathname?.startsWith("/portal/projects");

  const isProjectActive = (projectId: string) =>
    pathname === `/portal/projects/${projectId}` ||
    pathname?.startsWith(`/portal/projects/${projectId}/`);

  /* Shared nav content (rendered in both desktop + mobile) */
  const NavContent = (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Portal navigation">
        {/* Dashboard link */}
        <Link
          href="/portal"
          className={cn(
            "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-0",
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
              "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors min-h-0",
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
                        href={`/portal/projects/${project.id}`}
                        className={cn(
                          "block truncate rounded-[var(--radius-sm)] py-1.5 pl-11 pr-3 text-[13px] transition-colors min-h-0",
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
      </nav>

      {/* CTA: New Update */}
      {onNewUpdate && (
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
        className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))] shadow-[var(--shadow-lg)] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
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
