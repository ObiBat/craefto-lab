"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { HeroText } from "@/components/ui/motion";

// Dynamic import to avoid SSR issues with Three.js
const Metaballs = dynamic(
  () => import("@/components/ui/metaballs").then((mod) => mod.Metaballs),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-16 overflow-hidden">
      {/* Metaballs Background */}
      <div className="absolute inset-0 z-0">
        <Metaballs className="w-full h-full" />
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[hsl(var(--color-background))]/30 via-transparent to-[hsl(var(--color-background))]/80 pointer-events-none" />

      {/* Content */}
      <Container size="lg" className="relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          <HeroText delay={0}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1] text-balance">
              Built to compound.
            </h1>
          </HeroText>

          <HeroText delay={0.15}>
            <p className="text-lg sm:text-xl text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed text-pretty">
              Design systems and digital products for founders who measure success in years, not quarters.
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
