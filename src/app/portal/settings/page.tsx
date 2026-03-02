'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedSection } from '@/components/ui/motion';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { portalLoginPath } from '@/lib/portal/routes';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { NotificationSettings } from '@/components/portal/notification-settings';

// ---------------------------------------------------------------------------
// Settings Page — notification preferences
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { portalUser, user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userRole={portalUser?.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
          breadcrumbs={[{ label: 'Settings' }]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="Settings">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-2xl mx-auto">
            <AnimatedSection variant="fadeUp">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] mb-2">
                Settings
              </h1>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-8">
                Manage your notification preferences and account settings.
              </p>

              {/* Notification Preferences */}
              <section>
                <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)] mb-1">
                  Notifications
                </h2>
                <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-6">
                  Choose which notifications you would like to receive.
                </p>

                <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 sm:p-6">
                  <NotificationSettings />
                </div>
              </section>
            </AnimatedSection>
          </div>
        </main>
      </div>
    </div>
  );
}
