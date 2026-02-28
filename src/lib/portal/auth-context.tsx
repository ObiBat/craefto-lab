'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from './supabase-auth';
import type { User, Session } from '@supabase/supabase-js';
import type { PortalUser } from './types';

interface AuthContextValue {
  user: User | null;
  portalUser: PortalUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPortalUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  const fetchPortalUser = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('portal_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setPortalUser(data as PortalUser);
    }
  }, [supabase]);

  const refreshPortalUser = useCallback(async () => {
    if (user?.id) {
      await fetchPortalUser(user.id);
    }
  }, [user?.id, fetchPortalUser]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchPortalUser(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchPortalUser(s.user.id);
        } else {
          setPortalUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchPortalUser]);

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPortalUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        portalUser,
        session,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshPortalUser,
      }}
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
