"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import {
  Separator,
  PageTransition,
  AnimatedSection,
  StaggeredGrid,
  StaggeredItem,
  HeroText,
  SectionLabel,
  Badge,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/careers";

const whyCraefto = [
  {
    number: "01",
    title: "Craft over everything",
    description:
      "We care deeply about the quality of what we ship. No rushed deadlines, no half baked work. Every project gets the attention it deserves.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Real ownership",
    description:
      "You will not be a cog in a machine. Own features end to end, make decisions that matter, and see your work live in the world.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Diverse, meaningful projects",
    description:
      "From brand systems to AI automation, security audits to SaaS platforms. No two weeks look the same. You will grow fast.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Remote first, async first",
    description:
      "Work from wherever you do your best thinking. We value output over hours, clarity over meetings, and trust over surveillance.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const benefits = [
  {
    title: "Flexible hours",
    description: "Structure your day around your energy, not a clock.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Remote first",
    description: "Work from anywhere. Sydney, Bali, your couch. Your call.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: "Learning budget",
    description: "Courses, conferences, books, tools. We invest in your growth.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Project ownership",
    description: "Lead features, make architectural decisions, ship with your name on it.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Minimal meetings",
    description: "We write things down. Your calendar stays clean.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: "Modern stack",
    description: "Next.js, React, TypeScript, Tailwind, Figma, AI tools. The good stuff.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CareersPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="sm">
            <Container>
              <div className="max-w-3xl">
                <nav className="mb-8" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                    <li>
                      <Link href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li className="text-[hsl(var(--color-foreground))] font-medium">Careers</li>
                  </ol>
                </nav>

                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-6">
                    Build with us
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    Craefto is a creative tech studio where design and engineering are one discipline. We are looking for people who care about craft as much as we do.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Why Craefto */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="01" label="Why Craefto" />
                    <h2 className="font-semibold tracking-tight">
                      What makes this different
                    </h2>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-2">
                      We are building a studio where talented people do their best work on projects that matter.
                    </p>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {whyCraefto.map((item) => (
                    <StaggeredItem key={item.title}>
                      <div className="group p-6 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-border-strong))] hover:shadow-sm transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[hsl(var(--color-background-muted))] flex items-center justify-center text-[hsl(var(--color-foreground-muted))] group-hover:text-[hsl(var(--color-accent))] transition-colors flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[hsl(var(--color-accent))] tabular-nums">
                              {item.number}
                            </span>
                            <h3 className="font-semibold tracking-tight mt-1 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* Culture */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="02" label="Culture" />
                    <h2 className="font-semibold tracking-tight">
                      How we work
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Ship craft, not compromises.</strong> We would rather take an extra day to get it right than rush something out the door. Quality is not negotiable.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Own your work end to end.</strong> No silos, no handoffs into a void. You see your ideas through from concept to production.
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Learn by building real things.</strong> The fastest way to grow is by shipping meaningful work for real clients, not watching tutorials.
                      </p>
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Trust over process.</strong> We hire capable people and give them room to operate. Clear communication replaces rigid workflows.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Open Positions */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="03" label="Open Positions" />
                    <h2 className="font-semibold tracking-tight">
                      Current openings
                    </h2>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-2">
                      {roles.length > 0
                        ? `We have ${roles.length} open ${roles.length === 1 ? "role" : "roles"} right now. Find yours.`
                        : "No open positions right now, but we are always interested in meeting talented people."}
                    </p>
                  </div>
                </AnimatedSection>

                <Separator />

                {roles.length > 0 ? (
                  <StaggeredGrid className="flex flex-col gap-4">
                    {roles.map((role) => (
                      <StaggeredItem key={role.slug}>
                        <Link
                          href={`/careers/${role.slug}`}
                          className="group block p-6 md:p-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-border-strong))] hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="accent">{role.department}</Badge>
                                <Badge variant="secondary">{role.location}</Badge>
                                <Badge variant="secondary">{role.type}</Badge>
                              </div>
                              <h3 className="text-xl font-semibold tracking-tight group-hover:text-[hsl(var(--color-accent))] transition-colors">
                                {role.title}
                              </h3>
                              <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-lg">
                                {role.description.slice(0, 140)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--color-foreground-muted))] group-hover:text-[hsl(var(--color-accent))] transition-colors flex-shrink-0">
                              <span>View role</span>
                              <svg
                                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </StaggeredItem>
                    ))}
                  </StaggeredGrid>
                ) : (
                  <AnimatedSection delay={0.1}>
                    <div className="text-center py-12 px-6 rounded-xl border border-dashed border-[hsl(var(--color-border-strong))]">
                      <p className="text-lg text-[hsl(var(--color-foreground-muted))] mb-4">
                        No open positions right now.
                      </p>
                      <Button asChild>
                        <Link href="/contact">
                          <span className="btn-text-wrapper">
                            <span className="btn-text-primary">Send a general application</span>
                            <span className="btn-text-secondary" aria-hidden="true">Introduce yourself</span>
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </AnimatedSection>
                )}
              </div>
            </Container>
          </Section>

          {/* Benefits */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="04" label="Benefits" />
                    <h2 className="font-semibold tracking-tight">
                      What you get
                    </h2>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-2">
                      Beyond the work itself, here is what comes with being part of Craefto.
                    </p>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {benefits.map((benefit) => (
                    <StaggeredItem key={benefit.title}>
                      <div className="p-6 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-border-strong))] hover:shadow-sm transition-all">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-accent-subtle))] flex items-center justify-center text-[hsl(var(--color-accent))] mb-4">
                          {benefit.icon}
                        </div>
                        <h3 className="font-semibold tracking-tight mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* General Application CTA */}
          <Section spacing="xl">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-10 sm:p-14 md:p-20">
                  <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                    <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                      Open application
                    </span>
                    <h2 className="font-semibold tracking-tight !text-white">
                      Don&apos;t see your role?
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                      We are always interested in meeting talented people. If you care about craft and want to build meaningful things, introduce yourself.
                    </p>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="mt-2 !bg-white !text-[hsl(var(--color-accent))] hover:!bg-[hsl(var(--color-foreground))] hover:!text-white"
                      asChild
                    >
                      <Link href="/contact">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Introduce yourself
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                          <span className="btn-text-secondary" aria-hidden="true">
                            Say hello
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
