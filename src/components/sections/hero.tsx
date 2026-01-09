"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { HeroText } from "@/components/ui/motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16">
      <Container size="lg">
        <div className="flex flex-col items-center text-center gap-6">
          <HeroText delay={0}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter leading-[1.1] text-balance">
              Crafted Systems for shapers
              <br />
              who think long-term.
            </h1>
          </HeroText>

          <HeroText delay={0.15}>
            <p className="text-lg sm:text-xl text-[hsl(var(--color-foreground-muted))] max-w-2xl leading-relaxed text-pretty">
              Craefto Lab is a creative tech studio. We design and build brands,
              products, and tools for founders and teams who value craft.
            </p>
          </HeroText>

          <HeroText delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" asChild>
                <Link href="/contact">
                  <span className="btn-text-wrapper">
                    <span className="btn-text-primary">
                      Start a project
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                    <span className="btn-text-secondary" aria-hidden="true">
                      Let&apos;s build
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/work">
                  <span className="btn-text-wrapper">
                    <span className="btn-text-primary">View our work</span>
                    <span className="btn-text-secondary" aria-hidden="true">See projects</span>
                  </span>
                </Link>
              </Button>
            </div>
          </HeroText>
        </div>
      </Container>
    </section>
  );
}
