'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/portal/toast';

// ---------------------------------------------------------------------------
// Notification Settings — toggle switches for notification preferences
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'portal_notification_prefs';

interface NotificationPrefs {
  weekly_digest: boolean;
  instant_blockers: boolean;
  new_milestones: boolean;
  request_status_changes: boolean;
  invoice_reminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  weekly_digest: true,
  instant_blockers: true,
  new_milestones: true,
  request_status_changes: true,
  invoice_reminders: true,
};

interface ToggleOption {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  group: string;
}

const TOGGLE_OPTIONS: ToggleOption[] = [
  { key: 'weekly_digest', label: 'Weekly digest', description: 'Receive a summary of project activity every Monday.', group: 'Updates' },
  { key: 'instant_blockers', label: 'Instant on blockers', description: 'Get notified immediately when a project is blocked.', group: 'Updates' },
  { key: 'new_milestones', label: 'New milestones', description: 'Get notified when a milestone is reached.', group: 'Updates' },
  { key: 'request_status_changes', label: 'Request status changes', description: 'Get notified when your request status is updated.', group: 'Requests' },
  { key: 'invoice_reminders', label: 'Invoice reminders', description: 'Receive reminders for upcoming and overdue invoices.', group: 'Payments' },
];

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    setPrefs(loadPrefs());
    setMounted(true);
  }, []);

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs) => {
      const next = { ...prefs, [key]: !prefs[key] };
      setPrefs(next);
      savePrefs(next);
      toast('success', `${!prefs[key] ? 'Enabled' : 'Disabled'}: ${TOGGLE_OPTIONS.find((o) => o.key === key)?.label}`);
    },
    [prefs, toast],
  );

  if (!mounted) return null;

  // Group options by group
  const groups = TOGGLE_OPTIONS.reduce<Record<string, ToggleOption[]>>((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = [];
    acc[opt.group].push(opt);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([groupName, options]) => (
        <div key={groupName}>
          <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] mb-4">
            {groupName}
          </h3>
          <div className="space-y-1">
            {options.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[hsl(var(--color-background-subtle))]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                    {option.label}
                  </p>
                  <p className="text-xs text-[hsl(var(--color-foreground-muted))] mt-0.5">
                    {option.description}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[option.key]}
                  aria-label={option.label}
                  onClick={() => handleToggle(option.key)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2',
                    prefs[option.key]
                      ? 'bg-[hsl(var(--color-accent))]'
                      : 'bg-[hsl(var(--color-neutral-200))]',
                  )}
                >
                  <motion.span
                    className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm"
                    animate={{ x: prefs[option.key] ? 20 : 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 30 }
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
