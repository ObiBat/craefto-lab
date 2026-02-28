"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/portal/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoStatic } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  smoothTransition,
  instantTransition,
} from "@/components/ui/motion";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

function useMotionConfig() {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20 },
    visible: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0 },
  };

  const transition = prefersReducedMotion ? instantTransition : smoothTransition;

  const stagger = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15,
          },
        },
      };

  return { variants, transition, stagger, prefersReducedMotion };
}

// ---------------------------------------------------------------------------
// Decorative SVG grid pattern for the brand panel
// ---------------------------------------------------------------------------

function GridPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="portal-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#portal-grid)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Decorative floating shapes for depth
// ---------------------------------------------------------------------------

function FloatingShapes() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Large circle - top right */}
      <motion.div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(145 18% 36% / 0.12) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Medium circle - bottom left */}
      <motion.div
        className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(145 18% 36% / 0.08) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 12, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Small accent dot */}
      <motion.div
        className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-[hsl(var(--color-accent))]"
        style={{ opacity: 0.25 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand Panel (left side on desktop, header on mobile)
// ---------------------------------------------------------------------------

function BrandPanel() {
  const { variants, transition, prefersReducedMotion } = useMotionConfig();

  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))] p-8 lg:p-12 xl:p-16">
      {/* Grid pattern overlay */}
      <GridPattern className="text-[hsl(var(--color-background))]" />

      {/* Floating decorative shapes */}
      <FloatingShapes />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top - Logo + wordmark */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{
            ...transition,
            delay: prefersReducedMotion ? 0 : 0.1,
          }}
          className="flex items-center gap-3"
        >
          <LogoStatic size="md" inverted />
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
            Craefto Lab
          </span>
        </motion.div>

        {/* Center - Hero typography (hidden on mobile to save space) */}
        <div className="hidden lg:block my-auto py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{
              ...transition,
              delay: prefersReducedMotion ? 0 : 0.25,
            }}
          >
            <p className="font-[family-name:var(--font-sans)] text-sm font-medium uppercase tracking-[0.2em] text-[hsl(var(--color-background))]/60 mb-6">
              Client Portal
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl xl:text-5xl font-semibold leading-[1.1] tracking-tight text-[hsl(var(--color-background))]">
              Stakeholder
              <br />
              <span className="text-[hsl(145,18%,55%)]">Updates</span>
            </h1>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{
              ...transition,
              delay: prefersReducedMotion ? 0 : 0.4,
            }}
            className="mt-6 max-w-sm text-base leading-relaxed text-[hsl(var(--color-background))]/50 font-[family-name:var(--font-sans)]"
          >
            Real-time project visibility. Track progress, review updates, and
            stay aligned with your team.
          </motion.p>
        </div>

        {/* Bottom - decorative line + copyright */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{
            ...transition,
            delay: prefersReducedMotion ? 0 : 0.55,
          }}
          className="hidden lg:block"
        >
          <div className="h-px w-16 bg-[hsl(var(--color-background))]/20 mb-4" />
          <p className="text-xs text-[hsl(var(--color-background))]/30 font-[family-name:var(--font-sans)]">
            {new Date().getFullYear()} Craefto Lab. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

function LoginForm() {
  const router = useRouter();
  const { signIn, isDemo } = useAuth();
  const { variants, transition, stagger, prefersReducedMotion } =
    useMotionConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Basic client-side validation
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setIsLoading(true);

      try {
        await signIn(email.trim(), password);
        router.push("/portal");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Invalid credentials.";

        if (message.toLowerCase().includes("invalid")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, signIn, router]
  );

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="w-full max-w-sm mx-auto lg:mx-0"
      >
        {/* Mobile brand mark */}
        <motion.div
          variants={variants}
          transition={transition}
          className="mb-8 flex items-center gap-3 lg:hidden"
        >
          <LogoStatic size="sm" />
          <span className="font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
            Craefto Lab
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={variants} transition={transition}>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--color-foreground-muted))] font-[family-name:var(--font-sans)]">
            Sign in to your stakeholder portal
          </p>
        </motion.div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            role="alert"
            className="mt-6 rounded-[var(--radius-lg)] border border-[hsl(var(--color-error))]/20 bg-[hsl(var(--color-error-subtle))] px-4 py-3"
          >
            <p className="text-sm text-[hsl(var(--color-error))] font-[family-name:var(--font-sans)]">
              {error}
            </p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {/* Email */}
          <motion.div variants={variants} transition={transition}>
            <label
              htmlFor="portal-email"
              className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5 font-[family-name:var(--font-sans)]"
            >
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={!!error}
              disabled={isLoading}
              className="font-[family-name:var(--font-sans)]"
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={variants} transition={transition}>
            <label
              htmlFor="portal-password"
              className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5 font-[family-name:var(--font-sans)]"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="portal-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                error={!!error}
                disabled={isLoading}
                className="pr-12 font-[family-name:var(--font-sans)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))] transition-colors duration-200 min-h-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            variants={variants}
            transition={transition}
            className="pt-2"
          >
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </motion.div>
        </form>

          {/* Demo credentials hint */}
          {isDemo && (
            <div className="mt-4 rounded-lg border border-[hsl(var(--color-accent)/0.3)] bg-[hsl(var(--color-accent-subtle))] p-4">
              <p className="text-xs font-medium text-[hsl(var(--color-accent))] mb-1">Demo Mode</p>
              <p className="text-xs text-[hsl(var(--color-foreground-muted))]">
                Email: <span className="font-mono select-all">demo@craefto.com</span>
              </p>
              <p className="text-xs text-[hsl(var(--color-foreground-muted))]">
                Password: <span className="font-mono select-all">demo123456</span>
              </p>
            </div>
          )}

        {/* Demo credentials hint */}
        <motion.div
          variants={variants}
          transition={transition}
          className="mt-8"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--color-border))]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[hsl(var(--color-background))] px-3 text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
                Demo access
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] px-4 py-3">
            <p className="text-xs text-[hsl(var(--color-foreground-muted))] font-[family-name:var(--font-sans)] leading-relaxed">
              <span className="font-medium text-[hsl(var(--color-foreground))]">
                Demo:
              </span>{" "}
              demo@craefto.com / demo123456
            </p>
          </div>
        </motion.div>

        {/* Back to main site */}
        <motion.div
          variants={variants}
          transition={transition}
          className="mt-8 text-center lg:text-left"
        >
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-accent))] transition-colors duration-200 font-[family-name:var(--font-sans)] min-h-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to craefto.com
          </a>
        </motion.div>
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
      {/* Left: Brand panel (hidden below lg, shown as dark strip) */}
      <div className="hidden lg:flex">
        <BrandPanel />
      </div>

      {/* Mobile: Compact brand header */}
      <div className="lg:hidden bg-[hsl(var(--color-foreground))] px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoStatic size="sm" inverted />
            <span className="font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight text-[hsl(var(--color-background))]">
              Craefto Lab
            </span>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-[hsl(var(--color-background))]/40 font-[family-name:var(--font-sans)]">
            Portal
          </span>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-col bg-[hsl(var(--color-background))]">
        <LoginForm />
      </div>
    </main>
  );
}
