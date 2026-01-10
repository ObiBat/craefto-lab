"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText, SectionLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";

const values = [
  {
    number: "01",
    title: "Clarity over cleverness",
    description:
      "If it can't be explained simply, it's not ready.",
  },
  {
    number: "02",
    title: "Systems over shortcuts",
    description:
      "Foundations that scale, not fixes that create debt.",
  },
  {
    number: "03",
    title: "Craft over speed",
    description:
      "We ship when it's right. Details matter.",
  },
  {
    number: "04",
    title: "Partnership over transactions",
    description:
      "We work with clients, not for them.",
  },
];

const whatWeDontDo = [
  "Rush to ship half-baked work",
  "Follow trends without purpose",
  "Disappear after delivery",
  "Treat your project as just another job",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="sm">
            <Container>
              <div className="max-w-3xl">
                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-6">
                    About
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    A creative tech studio building systems for founders who think long-term.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Philosophy */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="01" label="Philosophy" />
                    <h2 className="font-semibold tracking-tight">
                      How we think
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Design and engineering as one.</strong> The best digital products come from treating them as one discipline, not separate departments.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Systems, not templates.</strong> Every project starts with understanding: what are you actually building, and why?
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Intentional foundations.</strong> We design systems that scale, maintain consistency, and evolve with your business.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Long-term thinking.</strong> The time we invest in foundations pays off in speed, quality, and longevity.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Values */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="02" label="Values" />
                    <h2 className="font-semibold tracking-tight">
                      What we value
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {values.map((value) => (
                    <StaggeredItem key={value.title}>
                      <div className="flex flex-col gap-4">
                        <span className="text-xs font-semibold text-[hsl(var(--color-accent))] tabular-nums">
                          {value.number}
                        </span>
                        <h3 className="font-semibold tracking-tight">
                          {value.title}
                        </h3>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* What We Don't Do */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="03" label="Boundaries" />
                    <h2 className="font-semibold tracking-tight">
                      What we don&apos;t do
                    </h2>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-2">
                      Being clear about what we won&apos;t do helps us focus on what we do best.
                    </p>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {whatWeDontDo.map((item, index) => (
                    <StaggeredItem key={item}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border border-[hsl(var(--color-border))]">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-[hsl(var(--color-foreground-muted))]">
                          {item}
                        </span>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* Looking Ahead */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="04" label="Future" />
                    <h2 className="font-semibold tracking-tight">
                      Looking ahead
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="max-w-2xl space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    <p>
                      <strong className="text-[hsl(var(--color-foreground))]">Beyond services.</strong> We&apos;re building toward our own products, tools, and systems we can release into the world.
                    </p>
                    <p>
                      <strong className="text-[hsl(var(--color-foreground))]">The Lab.</strong> Coming soon: experiments, R&D projects, and open resources. Building in public and sharing what we learn.
                    </p>
                    <p>
                      If you&apos;re a founder building something meaningful, we&apos;d love to hear from you.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* CTA */}
          <Section spacing="xl">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-10 sm:p-14 md:p-20">
                  <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                    <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                      Connect
                    </span>
                    <h2 className="font-semibold tracking-tight text-white">
                      Let&apos;s build something together
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                      Interested in new projects and collaborations with people who care about craft.
                    </p>
                    <Button size="lg" variant="secondary" className="mt-2 !bg-white !text-[hsl(var(--color-accent))] hover:!bg-white/90" asChild>
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
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
