import Link from "next/link";
import { Container } from "./container";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { navigation, siteConfig } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[hsl(var(--color-border-subtle))]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <Container>
        <div className="pt-12 pb-16 md:pt-14 md:pb-20">
          {/* Top section */}
          <div className="flex flex-col gap-8">
            {/* Logo and tagline */}
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="w-fit logo-link"
                aria-label="Craefto Lab - Home"
              >
                <Logo size="lg" />
              </Link>
              <p className="text-[hsl(var(--color-foreground-muted))] max-w-sm leading-relaxed">
                Crafting systems for shapers who think long-term.
              </p>
            </div>

            <Separator />

            {/* Navigation */}
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap gap-x-8 gap-y-3 list-none p-0 m-0">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[hsl(var(--color-foreground-muted))] transition-colors hover:text-[hsl(var(--color-foreground))] focus-visible:text-[hsl(var(--color-foreground))]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={navigation.cta.href}
                    className="text-sm text-[hsl(var(--color-foreground-muted))] transition-colors hover:text-[hsl(var(--color-foreground))] focus-visible:text-[hsl(var(--color-foreground))]"
                  >
                    {navigation.cta.name}
                  </Link>
                </li>
              </ul>
            </nav>

            <Separator />

            {/* Bottom section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                &copy; {currentYear} {siteConfig.name}. All rights reserved.
              </p>

              <nav aria-label="Social media links">
                <ul className="flex gap-6 list-none p-0 m-0">
                  {siteConfig.links.twitter && (
                    <li>
                      <a
                        href={siteConfig.links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--color-foreground-subtle))] transition-colors hover:text-[hsl(var(--color-foreground))] focus-visible:text-[hsl(var(--color-foreground))]"
                        aria-label="Follow us on Twitter (opens in new tab)"
                      >
                        Twitter
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  )}
                  {siteConfig.links.linkedin && (
                    <li>
                      <a
                        href={siteConfig.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--color-foreground-subtle))] transition-colors hover:text-[hsl(var(--color-foreground))] focus-visible:text-[hsl(var(--color-foreground))]"
                        aria-label="Connect with us on LinkedIn (opens in new tab)"
                      >
                        LinkedIn
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
