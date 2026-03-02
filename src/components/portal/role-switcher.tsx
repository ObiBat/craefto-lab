'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { isDemoMode } from '@/lib/portal/mock-data';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/portal/types';

// ---------------------------------------------------------------------------
// Role Switcher — floating demo-only pill for testing all role views
// ---------------------------------------------------------------------------

const ROLES: { value: UserRole; label: string; shortLabel: string }[] = [
  { value: 'admin', label: 'Admin', shortLabel: 'A' },
  { value: 'project_manager', label: 'PM', shortLabel: 'PM' },
  { value: 'team_member', label: 'Team', shortLabel: 'T' },
  { value: 'stakeholder', label: 'Stakeholder', shortLabel: 'S' },
];

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx={9} cy={7} r={4} />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ChevronUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function RoleSwitcher() {
  const { portalUser, switchDemoRole, user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  // Only render in demo mode and when logged in
  if (!isDemoMode() || !user) return null;

  const currentRole = portalUser?.role ?? 'admin';

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2" role="toolbar" aria-label="Demo role switcher">
      {/* Expanded role buttons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-1.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-2 shadow-lg"
          >
            <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))]">
              Switch Role
            </span>
            {ROLES.map((role) => {
              const isActive = currentRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    switchDemoRole(role.value);
                    setExpanded(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors min-h-[36px] whitespace-nowrap',
                    isActive
                      ? 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]'
                      : 'text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]',
                  )}
                  aria-pressed={isActive}
                >
                  <span className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-[hsl(var(--color-accent))] text-white'
                      : 'bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]',
                  )}>
                    {role.shortLabel}
                  </span>
                  {role.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg transition-colors min-h-[40px]',
          'border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]',
          'hover:bg-[hsl(var(--color-background-subtle))]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
        )}
        aria-expanded={expanded}
        aria-label={`Demo mode: viewing as ${getRoleLabel(currentRole)}. Click to switch role.`}
      >
        <UsersIcon />
        <span className="hidden sm:inline">{getRoleLabel(currentRole)}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronUpIcon />
        </motion.span>
      </button>
    </div>
  );
}
