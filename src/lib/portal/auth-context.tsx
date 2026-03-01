'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from './supabase-auth';
import { DEMO_CREDENTIALS, getMockUser } from './mock-data';
import type { User, Session } from '@supabase/supabase-js';
import type { PortalUser } from './types';

interface AuthContextValue {
  user: User | null;
  portalUser: PortalUser | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPortalUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Check if the portal has its own Supabase tables set up.
 * Until NEXT_PUBLIC_PORTAL_LIVE=true is set, we run in demo mode
 * even if Supabase env vars exist (they're used by other site features).
 */
function isPortalDemoMode(): boolean {
  if (typeof window === 'undefined') return true;
  return process.env.NEXT_PUBLIC_PORTAL_LIVE !== 'true';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = isPortalDemoMode();

  const supabase = isDemo ? null : createBrowserClient();

  const fetchPortalUser = useCallback(async (userId: string) => {
    if (isDemo) {
      setPortalUser(getMockUser());
      return;
    }
    if (!supabase) return;
    const { data } = await supabase
      .from('portal_users')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setPortalUser(data as PortalUser);
  }, [supabase, isDemo]);

  const refreshPortalUser = useCallback(async () => {
    if (user?.id) await fetchPortalUser(user.id);
  }, [user?.id, fetchPortalUser]);

  useEffect(() => {
    if (isDemo) {
      const demoLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('portal_demo_auth');
      if (demoLoggedIn) {
        const mockUser = getMockUser();
        setUser({ id: mockUser.id, email: mockUser.email } as User);
        setPortalUser(mockUser);
      }
      setLoading(false);
      return;
    }

    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchPortalUser(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await fetchPortalUser(s.user.id);
        else setPortalUser(null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchPortalUser, isDemo]);

  const handleSignIn = async (email: string, password: string) => {
    // Always accept demo credentials (even when Supabase is configured)
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const mockUser = getMockUser();
      setUser({ id: mockUser.id, email: mockUser.email } as User);
      setPortalUser(mockUser);
      setSession({ user: { id: mockUser.id, email: mockUser.email } } as Session);
      if (typeof window !== 'undefined') sessionStorage.setItem('portal_demo_auth', '1');
      return;
    }

    // Non-demo credentials: try Supabase if available
    if (!supabase) {
      throw new Error('Invalid credentials. Use demo@craefto.com / demo123456');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('portal_demo_auth');
    if (supabase) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    setUser(null);
    setPortalUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, portalUser, session, loading, isDemo, signIn: handleSignIn, signOut: handleSignOut, refreshPortalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
