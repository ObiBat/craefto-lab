"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { navigation } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Navigate from mobile menu: close menu first, then navigate
  const handleMobileNav = React.useCallback((href: string) => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
    // Let the menu start closing, then navigate
    requestAnimationFrame(() => {
      router.push(href);
    });
  }, [router]);

  const handleLogoClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close menu when route changes (safety net)
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  // Close menu on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isMobileMenuOpen
            ? "bg-[hsl(var(--color-foreground))] backdrop-blur-0 border-transparent shadow-none"
            : isScrolled
              ? "bg-[hsl(var(--color-background))]/95 backdrop-blur-md border-b border-[hsl(var(--color-border))] shadow-sm"
              : "bg-transparent"
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "flex-shrink-0 logo-link",
                isMobileMenuOpen && "logo-inverted"
              )}
              onClick={handleLogoClick}
              aria-label="Craefto - Home"
            >
              <Logo
                size="md"
                inverted={isMobileMenuOpen}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.main.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link group relative px-4 py-2 overflow-hidden"
                >
                  <span className="nav-link-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="nav-link-text">
                    <span className="nav-link-text-primary">{item.name}</span>
                    <span className="nav-link-text-secondary" aria-hidden="true">{item.name}</span>
                  </span>
                </Link>
              ))}
              <div className="ml-4">
                <Button size="sm" asChild>
                  <Link href={navigation.cta.href}>
                    <span className="btn-text-wrapper">
                      <span className="btn-text-primary">{navigation.cta.name}</span>
                      <span className="btn-text-secondary" aria-hidden="true">Let&apos;s talk</span>
                    </span>
                  </Link>
                </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={cn(
                "md:hidden relative z-50 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                isMobileMenuOpen
                  ? "bg-white/20"
                  : "hover:bg-[hsl(var(--color-background-muted))]"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="hamburger-wrapper">
                <span className={cn(
                  "hamburger-line",
                  isMobileMenuOpen && "hamburger-line-active-1 !bg-white"
                )} />
                <span className={cn(
                  "hamburger-line",
                  isMobileMenuOpen && "hamburger-line-active-2"
                )} />
                <span className={cn(
                  "hamburger-line",
                  isMobileMenuOpen && "hamburger-line-active-3 !bg-white"
                )} />
              </div>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 transition-all duration-500 ease-out",
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Background overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-[hsl(var(--color-foreground))] transition-transform duration-500 ease-out origin-top",
            isMobileMenuOpen ? "scale-y-100" : "scale-y-0"
          )}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col pt-24 pb-8 px-6 overflow-y-auto">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[...navigation.main, ...navigation.secondary].map((item, index) => (
              <button
                key={item.name}
                type="button"
                className={cn(
                  "mobile-nav-link group flex items-baseline gap-4 py-4 border-b border-white/15 w-full text-left",
                  isMobileMenuOpen && "mobile-nav-link-active"
                )}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 75 + 150}ms` : "0ms"
                }}
                onClick={() => handleMobileNav(item.href)}
              >
                <span className="mobile-nav-index text-xs font-medium text-white/50 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mobile-nav-text text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {item.name}
                </span>
                <svg
                  className="ml-auto w-5 h-5 text-white/50 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            ))}
          </nav>

          {/* Mobile CTA */}
          <div
            className={cn(
              "mt-auto pt-8 transition-all duration-500",
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: isMobileMenuOpen ? "450ms" : "0ms" }}
          >
            <Button
              variant="secondary"
              size="lg"
              className="w-full !bg-[hsl(var(--color-accent))] !text-white !border-0 font-semibold"
              onClick={() => handleMobileNav(navigation.cta.href)}
            >
              <span className="btn-text-wrapper">
                <span className="btn-text-primary">{navigation.cta.name}</span>
                <span className="btn-text-secondary" aria-hidden="true">Let&apos;s talk</span>
              </span>
            </Button>

            {/* Contact info */}
            <div
              className={cn(
                "mt-8 pt-6 border-t border-white/15 transition-all duration-500",
                isMobileMenuOpen ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: isMobileMenuOpen ? "550ms" : "0ms" }}
            >
              <p className="text-sm text-white/60 mb-2">Get in touch</p>
              <a
                href="mailto:hello@craefto.com"
                className="text-white font-medium hover:underline"
              >
                hello@craefto.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
