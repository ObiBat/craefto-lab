"use client";

import { Header, Footer, Container, Section } from "@/components/layout";
import { PageTransition, HeroText, AnimatedSection } from "@/components/ui";

export default function LabPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          <Section spacing="xl">
            <Container>
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-6 max-w-lg">
                  <AnimatedSection variant="scaleIn">
                    <div className="w-16 h-16 rounded-xl bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[hsl(var(--color-foreground-muted))]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                  </AnimatedSection>

                  <HeroText delay={0.1}>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                      Lab
                    </h1>
                  </HeroText>

                  <HeroText delay={0.2}>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      Experiments, tools, and R&D.
                      <br />
                      <span className="text-[hsl(var(--color-foreground-subtle))]">
                        Coming soon.
                      </span>
                    </p>
                  </HeroText>

                  <AnimatedSection delay={0.3} variant="fadeUp">
                    <div className="mt-4 p-4 rounded-lg border border-dashed border-[hsl(var(--color-border))]">
                      <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                        We&apos;re building in public. Follow along on{" "}
                        <a
                          href="https://twitter.com/craeftolab"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 hover:text-[hsl(var(--color-foreground))]"
                        >
                          Twitter
                        </a>{" "}
                        for updates.
                      </p>
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </Container>
          </Section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
