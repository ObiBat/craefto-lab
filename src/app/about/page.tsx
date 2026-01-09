"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText } from "@/components/ui";
import { Button } from "@/components/ui/button";

const values = [
  {
    title: "Clarity over cleverness",
    description:
      "If it can't be explained simply, it's not ready. We value clear thinking and clear communication above all.",
  },
  {
    title: "Systems over shortcuts",
    description:
      "We build foundations that scale, not quick fixes that create debt. Every decision considers the long game.",
  },
  {
    title: "Craft over speed",
    description:
      "Quality takes time. We don't rush to ship, we ship when it's right. The details matter.",
  },
  {
    title: "Partnership over transactions",
    description:
      "We work with clients, not for them. The best outcomes come from real collaboration and shared ownership.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="xs">
            <Container>
              <div className="max-w-3xl">
                <HeroText>
                  <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
                    About
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    Craefto Lab is a creative tech studio building systems for
                    founders and teams who think long-term.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Philosophy */}
          <Section spacing="md">
            <Container>
              <div className="flex flex-col gap-12">
                <AnimatedSection>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Philosophy
                  </h2>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="max-w-3xl space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    <p>
                      We believe the best digital products come from treating design
                      and engineering as one discipline, not separate departments
                      that hand off work.
                    </p>
                    <p>
                      We don&apos;t build templates. We don&apos;t follow trends for
                      their own sake. Every project starts with understanding: what
                      are you actually trying to build, and why does it matter?
                    </p>
                    <p>
                      From there, we design systems, not just interfaces. Systems
                      that scale, that maintain consistency, that can evolve as your
                      business grows.
                    </p>
                    <p>
                      This isn&apos;t about being slow or precious. It&apos;s about
                      being intentional. The time we invest in foundations pays off
                      in speed, quality, and longevity.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Values */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-12">
                <AnimatedSection>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    What we value
                  </h2>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {values.map((value) => (
                    <StaggeredItem key={value.title}>
                      <div className="p-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                        <h3 className="text-lg font-semibold tracking-tight mb-3">
                          {value.title}
                        </h3>
                        <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {value.description}
                        </p>
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
              <div className="flex flex-col gap-12">
                <AnimatedSection>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Looking ahead
                  </h2>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="max-w-3xl space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    <p>
                      Craefto Lab is more than a service studio. We&apos;re building
                      toward our own products, tools, and systems. Things we can
                      release into the world.
                    </p>
                    <p>
                      The Lab section (coming soon) will be home to experiments, R&D
                      projects, and open resources. We believe in building in public
                      and sharing what we learn.
                    </p>
                    <p>
                      If you&apos;re a founder, creator, or team building something
                      meaningful, we&apos;d love to hear from you.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* CTA */}
          <Section spacing="lg">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-xl bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] p-8 sm:p-12 md:p-16">
                  <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                      Let&apos;s build something together
                    </h2>
                    <p className="text-[hsl(var(--color-foreground-muted))] text-lg leading-relaxed">
                      We&apos;re always interested in new projects and
                      collaborations with people who care about craft.
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
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
