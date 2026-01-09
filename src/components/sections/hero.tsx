"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { HeroText } from "@/components/ui/motion";

const Metaballs = dynamic(
  () => import("@/components/ui/metaballs").then((mod) => mod.Metaballs),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background layer for blend mode to work against */}
      <div className="absolute inset-0 bg-[hsl(var(--color-background))] z-0" />

      {/* 3D Animation - desktop: right side, mobile: behind text offset right */}
      <div className="absolute inset-0 z-[1] pointer-events-none md:left-auto md:right-0 md:w-[55%] translate-x-[30%] md:translate-x-0">
        <Metaballs className="w-full h-full" />
      </div>

      {/* Content - left aligned with blend mode for text inversion */}
      <Container size="lg" className="relative z-10">
        <div className="flex flex-col items-start text-left gap-6 max-w-xl lg:max-w-2xl">
          {/* Headline with mix-blend-mode: difference - white text inverts to dark on light bg, stays light on dark shapes */}
          <HeroText delay={0}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.95] text-white mix-blend-difference">
              Built to compound.
            </h1>
          </HeroText>

          {/* Subtext with blend mode - slightly off-white for softer contrast */}
          <HeroText delay={0.15}>
            <p className="text-lg sm:text-xl text-[#E8E5E0] max-w-lg leading-relaxed mix-blend-difference">
              Design systems and digital products for founders who measure success in years, not quarters.
            </p>
          </HeroText>

          {/* Buttons stay normal - no blend mode */}
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
