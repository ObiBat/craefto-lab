"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText, SectionLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Team } from "@/components/sections/team";

const principles = [
  {
    title: "Open by default",
    description: "We share our learnings, code, and experiments with the community.",
  },
  {
    title: "Practical over theoretical",
    description: "Everything we build is tested in real client projects first.",
  },
  {
    title: "Quality over quantity",
    description: "We'd rather ship one great tool than ten mediocre ones.",
  },
];

export default function LabPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="sm" className="pb-8 md:pb-6">
            <Container>
              <div className="max-w-3xl">
                {/* Breadcrumb */}
                <nav className="mb-6 md:mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                    <li>
                      <a href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li className="text-[hsl(var(--color-foreground))] font-medium">About</li>
                  </ol>
                </nav>

                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-4">
                    About Cræfto Lab
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    Experiments, tools, and R&D. Where we push boundaries and build what&apos;s next.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Vision */}
          <Section spacing="lg" className="pt-0 md:pt-0">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="01" label="Vision" />
                    <h2 className="font-semibold tracking-tight">
                      Building in public
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Beyond client work.</strong> The Lab is where we explore ideas that don&apos;t fit neatly into project scopes: tools we wish existed, patterns we keep using, experiments worth sharing.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">From practice to product.</strong> Every experiment starts as something we need ourselves. If it proves valuable, we polish it for others.
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Transparency by design.</strong> We document our process, share our failures, and release what works under open licenses when possible.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Community first.</strong> Feedback shapes direction. The best tools are built in conversation with the people who use them.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Principles */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="02" label="Principles" />
                    <h2 className="font-semibold tracking-tight">
                      How we approach R&D
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {principles.map((principle, index) => (
                    <StaggeredItem key={principle.title}>
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold text-[hsl(var(--color-accent))] tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-semibold tracking-tight">{principle.title}</h3>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* Team */}
          <Team sectionNumber="03" />

          {/* Newsletter / Stay Updated */}
          <Section spacing="lg" className="pt-8 md:pt-12">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] p-10 sm:p-14 md:p-16">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-xl">
                      <span className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--color-foreground-subtle))]">
                        Stay Updated
                      </span>
                      <h2 className="font-semibold tracking-tight mt-3 mb-4">
                        Get notified when we ship
                      </h2>
                      <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                        We&apos;ll send you updates when new experiments go live, tools get released, or we publish findings worth sharing.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                      <Button size="lg" asChild>
                        <a href="https://x.com/craefto" target="_blank" rel="noopener noreferrer">
                          <span className="btn-text-wrapper">
                            <span className="btn-text-primary">
                              Follow on X
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                            <span className="btn-text-secondary" aria-hidden="true">
                              Follow on X
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          </span>
                        </a>
                      </Button>
                      <Button size="lg" variant="secondary" asChild>
                        <Link href="/journal">
                          <span className="btn-text-wrapper">
                            <span className="btn-text-primary">Read Journal</span>
                            <span className="btn-text-secondary" aria-hidden="true">Read Journal</span>
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* CTA */}
          <Section spacing="lg" className="pt-0">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-10 sm:p-14 md:p-16">
                  <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                    <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                      Collaborate
                    </span>
                    <h2 className="font-semibold tracking-tight !text-white">
                      Have an experiment in mind?
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                      We&apos;re open to collaborations on tools, research, and experiments that push the boundaries of creative technology.
                    </p>
                    <Button size="lg" variant="secondary" className="mt-2 !bg-white !text-[hsl(var(--color-accent))] hover:!bg-[hsl(var(--color-foreground))] hover:!text-white" asChild>
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
                            Let&apos;s explore together
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
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
