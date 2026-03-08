'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/portal/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoStatic } from '@/components/ui/logo';
import { portalDashboardPath } from '@/lib/portal/routes';

// ---------------------------------------------------------------------------
// Brand Panel (left side on desktop)
// ---------------------------------------------------------------------------

function BrandPanel() {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden p-8 lg:p-12 xl:p-16"
      style={{ backgroundColor: '#1A1A1A', color: '#FAF9F6' }}
    >
      {/* Grid pattern */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="portal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#portal-grid)" />
      </svg>

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoStatic size="md" inverted />
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Cræfto
          </span>
        </div>

        {/* Tagline */}
        <div className="hidden lg:block my-auto py-16">
          <h1
            className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Your project,
            <br />
            always in view.
          </h1>
          <p className="text-base leading-relaxed max-w-sm opacity-50" style={{ fontFamily: 'var(--font-sans)' }}>
            Track progress, review updates, and stay aligned.
          </p>
        </div>

        {/* Footer */}
        <div className="hidden lg:block">
          <div className="h-px w-16 mb-4 opacity-20" style={{ backgroundColor: '#FAF9F6' }} />
          <p className="text-xs opacity-30" style={{ fontFamily: 'var(--font-sans)' }}>
            {new Date().getFullYear()} Cræfto. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!email.trim()) { setError('Please enter your email address.'); return; }
      if (!password) { setError('Please enter your password.'); return; }

      setIsLoading(true);
      try {
        await signIn(email.trim(), password);
        const dashPath = portalDashboardPath();
        if (dashPath === '/') {
          window.location.href = '/';
        } else {
          router.push(dashPath);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid credentials.';
        setError(message.toLowerCase().includes('invalid') ? 'Invalid email or password.' : message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, signIn, router],
  );

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm mx-auto lg:mx-0"
      >
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <LogoStatic size="sm" />
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
            Cræfto
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
          Welcome back
        </h2>
        <p className="text-sm mb-8" style={{ color: '#6B6560', fontFamily: 'var(--font-sans)' }}>
          Sign in to your project portal
        </p>

        {error && (
          <div className="mb-6 rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(193, 85, 59, 0.2)', backgroundColor: 'rgba(193, 85, 59, 0.05)' }}>
            <p className="text-sm" style={{ color: '#C1553B', fontFamily: 'var(--font-sans)' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="portal-email" className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A', fontFamily: 'var(--font-sans)' }}>
              Email
            </label>
            <Input
              id="portal-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              error={!!error}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="portal-password" className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A', fontFamily: 'var(--font-sans)' }}>
              Password
            </label>
            <Input
              id="portal-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
              error={!!error}
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="default" size="lg" loading={isLoading} disabled={isLoading} className="w-full">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center lg:text-left">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
            style={{ color: '#6B6560', fontFamily: 'var(--font-sans)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to craefto.com
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.15fr]">
      <div className="hidden lg:flex">
        <BrandPanel />
      </div>
      <div className="flex flex-col" style={{ backgroundColor: '#FAF9F6' }}>
        <LoginForm />
      </div>
    </main>
  );
}
