"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/motion";

export function CTABlock() {
  return (
    <Section spacing="xl">
      <Container>
        <AnimatedSection>
          <div className="rounded-2xl bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] p-10 sm:p-14 md:p-20">
            <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
              <span className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--color-accent))]">
                Start a project
              </span>
              <h2 className="font-semibold tracking-tight">
                Ready to build something that lasts?
              </h2>
              <p className="text-[hsl(var(--color-foreground-muted))] text-lg leading-relaxed max-w-lg">
                Let&apos;s talk about your project. We work with founders who value clarity, craft, and long-term thinking.
              </p>
              <Button size="lg" className="mt-2" asChild>
                <Link href="/contact">
                  <span className="btn-text-wrapper">
                    <span className="btn-text-primary">
                      Start a conversation
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
                      Say hello
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
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </Section>
  );
}
