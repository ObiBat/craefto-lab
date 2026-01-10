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
    <section className="relative min-h-[100vh] flex items-center pt-20 pb-16 overflow-hidden bg-[hsl(var(--color-background))]">
      {/* 3D Animation - desktop: right side, mobile: bottom 15% */}
      <div className="absolute left-0 right-0 top-[15%] bottom-0 z-0 pointer-events-none translate-x-[15%] md:top-0 md:left-auto md:right-0 md:w-[55%] md:translate-x-0">
        <Metaballs className="w-full h-full" />
      </div>

      {/* Content - left aligned */}
      <Container size="lg" className="relative z-10">
        <div className="flex flex-col items-start text-left gap-6 max-w-xl lg:max-w-2xl">
          <HeroText delay={0}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.95] text-[#4A4A4A]">
              Built to compound.
            </h1>
          </HeroText>

          <HeroText delay={0.15}>
            <p className="text-lg sm:text-xl max-w-lg leading-relaxed text-[#6B6B6B]">
              Design systems and digital products built with craft and intention.
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
                    <span className="btn-text-primary">Case studies</span>
                    <span className="btn-text-secondary" aria-hidden="true">See our work</span>
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
