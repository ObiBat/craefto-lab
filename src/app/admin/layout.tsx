"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CommandPalette } from "@/components/admin/CommandPalette";

const NAV_ITEMS = [
  { href: "/admin", label: "Command Center", icon: "command" },
  { href: "/admin/clients", label: "Clients", icon: "briefcase" },
  { href: "/admin/team", label: "Team", icon: "users" },
  { href: "/admin/projects", label: "Projects", icon: "folder" },
  { href: "/admin/finances", label: "Finances", icon: "dollar" },
  { href: "/admin/leads", label: "Leads", icon: "target" },
  { href: "/admin/proposals", label: "Proposals", icon: "file" },
];

// Keep legacy routes accessible (not in sidebar but still functional)
const LEGACY_ROUTES = [
  "/admin/documents",
  "/admin/subscribers",
  "/admin/journal",
  "/admin/pipeline",
  "/admin/analytics",
  "/admin/intelligence",
  "/admin/client-hub",
];

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "command":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "folder":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case "dollar":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "target":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
          <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
          <circle cx="12" cy="12" r="2" strokeWidth={1.5} />
        </svg>
      );
    case "file":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const authToken = sessionStorage.getItem("admin_auth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      sessionStorage.setItem("admin_auth", "authenticated");
      setIsAuthenticated(true);
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--color-background))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--color-accent))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[hsl(var(--color-background))] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-1 text-[hsl(var(--color-foreground))]">Craefto</h1>
            <p className="text-xs tracking-[0.2em] uppercase text-[hsl(var(--color-foreground-subtle))] mb-4">Operations</p>
            <p className="text-[hsl(var(--color-foreground-muted))]">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] transition-colors"
              autoFocus
            />
            {error && <p className="text-[hsl(var(--color-error))] text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium rounded-xl hover:bg-[hsl(var(--color-primary-hover))] transition-colors"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-6">
            <Link href="/" className="text-sm text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors">
              &larr; Back to site
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-[hsl(var(--color-background-subtle))] border-b border-[hsl(var(--color-border))]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Craefto</span>
          <span className="text-[10px] tracking-[0.15em] uppercase text-[hsl(var(--color-foreground-subtle))] mt-0.5">Ops</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-[hsl(var(--color-background-muted))] transition-colors text-[hsl(var(--color-foreground))]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[hsl(var(--color-foreground))]/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 bg-[hsl(var(--color-background-subtle))] border-r border-[hsl(var(--color-border))] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden h-14 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Craefto</span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-[hsl(var(--color-foreground-subtle))] mt-0.5">Ops</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-[hsl(var(--color-background-muted))] transition-colors text-[hsl(var(--color-foreground))]"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop header - Wordmark */}
        <div className="hidden lg:flex flex-col px-5 pt-6 pb-2">
          <span className="text-xl font-semibold tracking-tight text-[hsl(var(--color-foreground))]">Craefto</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--color-foreground-subtle))] mt-0.5">Operations</span>
        </div>

        {/* Command Palette Trigger */}
        <div className="hidden lg:block px-4 py-3">
          <CommandPalette />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? "bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-foreground))]"
                    : "text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))]/50"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[hsl(var(--color-accent))]" />
                )}
                <NavIcon icon={item.icon} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-[hsl(var(--color-border))]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))]/50 rounded-lg transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] min-h-screen">
        <div className="h-14 lg:hidden" />
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
