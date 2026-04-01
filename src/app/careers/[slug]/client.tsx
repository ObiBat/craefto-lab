"use client";

import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import {
  PageTransition,
  AnimatedSection,
  StaggeredGrid,
  StaggeredItem,
  HeroText,
} from "@/components/ui";
import type { Role } from "@/lib/careers";

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface RolePageClientProps {
  role: Role;
  applyHref: string;
}

export function RolePageClient({ role, applyHref }: RolePageClientProps) {
  return (
    <PageTransition>
      <main id="main-content" className="pt-20">
        {/* Hero */}
        <Section spacing="sm">
          <Container>
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="mb-8" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-[hsl(var(--color-foreground))] transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="hover:text-[hsl(var(--color-foreground))] transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li className="text-[hsl(var(--color-foreground))] font-medium">
                    {role.title}
                  </li>
                </ol>
              </nav>

              {/* Tags */}
              <HeroText>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge variant="accent">{role.department}</Badge>
                  <Badge variant="secondary">{role.location}</Badge>
                  <Badge variant="secondary">{role.type}</Badge>
                </div>
              </HeroText>

              <HeroText delay={0.05}>
                <h1 className="font-semibold tracking-tight mb-6">
                  {role.title}
                </h1>
              </HeroText>

              <HeroText delay={0.1}>
                <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                  {role.description}
                </p>
              </HeroText>

              <HeroText delay={0.15}>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button size="lg" asChild>
                    <a href={applyHref}>
                      <span className="btn-text-wrapper">
                        <span className="btn-text-primary">
                          Apply for this role
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
                          Send application
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
                    </a>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/careers">
                      <span className="btn-text-wrapper">
                        <span className="btn-text-primary">All positions</span>
                        <span className="btn-text-secondary" aria-hidden="true">
                          Browse roles
                        </span>
                      </span>
                    </Link>
                  </Button>
                </div>
              </HeroText>
            </div>
          </Container>
        </Section>

        {/* Role metadata bar */}
        <Section spacing="xs">
          <Container>
            <AnimatedSection>
              <div className="flex flex-wrap gap-8 py-6 px-6 rounded-xl bg-[hsl(var(--color-background-subtle))] text-sm">
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))] block mb-1">
                    Department
                  </span>
                  <span className="font-medium text-[hsl(var(--color-foreground))]">
                    {role.department}
                  </span>
                </div>
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))] block mb-1">
                    Location
                  </span>
                  <span className="font-medium text-[hsl(var(--color-foreground))]">
                    {role.location}
                  </span>
                </div>
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))] block mb-1">
                    Type
                  </span>
                  <span className="font-medium text-[hsl(var(--color-foreground))]">
                    {role.type}
                  </span>
                </div>
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))] block mb-1">
                    Posted
                  </span>
                  <span className="font-medium text-[hsl(var(--color-foreground))]">
                    {formatDate(role.postedDate)}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </Container>
        </Section>

        {/* Responsibilities */}
        <Section spacing="lg">
          <Container size="lg">
            <div className="flex flex-col gap-14">
              <AnimatedSection>
                <div className="flex flex-col gap-4">
                  <SectionLabel number="01" label="Responsibilities" />
                  <h2 className="font-semibold tracking-tight">
                    What you&apos;ll do
                  </h2>
                </div>
              </AnimatedSection>

              <Separator />

              <StaggeredGrid className="flex flex-col gap-4">
                {role.responsibilities.map((item, index) => (
                  <StaggeredItem key={index}>
                    <div className="flex items-start gap-4 py-3">
                      <span className="text-xs font-semibold text-[hsl(var(--color-accent))] tabular-nums mt-1 flex-shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </StaggeredItem>
                ))}
              </StaggeredGrid>
            </div>
          </Container>
        </Section>

        {/* Requirements */}
        <Section spacing="lg">
          <Container size="lg">
            <div className="flex flex-col gap-14">
              <AnimatedSection>
                <div className="flex flex-col gap-4">
                  <SectionLabel number="02" label="Requirements" />
                  <h2 className="font-semibold tracking-tight">
                    What we&apos;re looking for
                  </h2>
                </div>
              </AnimatedSection>

              <Separator />

              <AnimatedSection delay={0.1}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-4">
                  {role.requirements.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 py-3">
                      <svg
                        className="w-5 h-5 text-[hsl(var(--color-accent))] flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </Container>
        </Section>

        {/* Nice to Haves */}
        {role.niceToHaves.length > 0 && (
          <Section spacing="lg">
            <Container size="lg">
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="03" label="Bonus" />
                    <h2 className="font-semibold tracking-tight">
                      Nice to have
                    </h2>
                    <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-2">
                      These are not requirements, but they would help you hit the ground running.
                    </p>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {role.niceToHaves.map((item, index) => (
                    <StaggeredItem key={index}>
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-accent-subtle))] flex items-center justify-center text-[hsl(var(--color-accent))] flex-shrink-0">
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-[hsl(var(--color-foreground-muted))]">
                          {item}
                        </span>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>
        )}

        {/* Apply CTA */}
        <Section spacing="xl">
          <Container>
            <AnimatedSection variant="scaleIn">
              <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-10 sm:p-14 md:p-20">
                <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                  <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                    Apply
                  </span>
                  <h2 className="font-semibold tracking-tight !text-white">
                    Ready to build with us?
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                    Send us your portfolio and a note about why this role interests you. We read every application.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="!bg-white !text-[hsl(var(--color-accent))] hover:!bg-[hsl(var(--color-foreground))] hover:!text-white"
                      asChild
                    >
                      <a href={applyHref}>
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Apply now
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
                          <span
                            className="btn-text-secondary"
                            aria-hidden="true"
                          >
                            Send application
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
                      </a>
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="!border-white/30 !text-white hover:!bg-white/10"
                      asChild
                    >
                      <Link href="/careers">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            All positions
                          </span>
                          <span
                            className="btn-text-secondary"
                            aria-hidden="true"
                          >
                            Browse roles
                          </span>
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </Container>
        </Section>
      </main>
    </PageTransition>
  );
}
