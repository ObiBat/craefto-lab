"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText, SectionLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "brand",
    number: "01",
    title: "Brand Identity & Design Systems",
    tagline: "Strategic foundations that scale",
    description:
      "We create brands that communicate clearly and design systems that maintain consistency across every touchpoint.",
    includes: [
      "Brand strategy & positioning",
      "Logo & visual identity",
      "Design system & component library",
      "Brand guidelines documentation",
    ],
  },
  {
    id: "web",
    number: "02",
    title: "Web Design & Development",
    tagline: "Design and engineering as one",
    description:
      "Marketing sites, SaaS platforms, and dashboards. No handoffs, no lost context between design and code.",
    includes: [
      "Information architecture & UX",
      "Visual design & prototyping",
      "Frontend development (React, Next.js)",
      "Performance optimization",
    ],
  },
  {
    id: "creative",
    number: "03",
    title: "Creative-Tech Products",
    tagline: "Memorable digital moments",
    description:
      "Interactive experiences, 3D, and experimental web work for brands that want to push boundaries.",
    includes: [
      "Interactive storytelling",
      "3D & WebGL experiences",
      "Generative & data-driven art",
      "Campaign microsites",
    ],
  },
  {
    id: "saas",
    number: "04",
    title: "SaaS & Internal Tools",
    tagline: "Tools your business needs",
    description:
      "MVPs, client portals, and automation systems. Customer-facing or internal operations.",
    includes: [
      "Product strategy & scoping",
      "UI/UX design",
      "Full-stack development",
      "API integrations",
    ],
  },
  {
    id: "ai",
    number: "05",
    title: "AI-Powered Systems",
    tagline: "AI as a force multiplier",
    description:
      "Workflows, agents, and intelligence tools. Meaningful AI, not buzzwords.",
    includes: [
      "AI strategy & use case discovery",
      "Custom agent development",
      "Workflow automation",
      "LLM integrations",
    ],
  },
];

const workProcess = [
  {
    number: "01",
    title: "Discovery",
    description:
      "Understand goals, context, and constraints.",
  },
  {
    number: "02",
    title: "Proposal",
    description:
      "Clear scope, timeline, and investment.",
  },
  {
    number: "03",
    title: "Execution",
    description:
      "Build in focused sprints with regular check-ins.",
  },
  {
    number: "04",
    title: "Launch & Support",
    description:
      "Deploy, test, and support post-launch.",
  },
];

export default function ServicesPage() {
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
                    Services
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    Tailored systems, not templates. Each project is approached from first principles.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Anchor Navigation */}
          <Section spacing="xs">
            <Container>
              <AnimatedSection>
                <nav className="flex flex-wrap gap-3">
                  {services.map((service) => (
                    <a
                      key={service.id}
                      href={`#${service.id}`}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:border-[hsl(var(--color-foreground))] transition-colors"
                    >
                      {service.title.split(" ")[0]}
                    </a>
                  ))}
                </nav>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Services List */}
          <Section spacing="md">
            <Container>
              <div className="flex flex-col gap-20">
                {services.map((service, index) => (
                  <AnimatedSection key={service.id} delay={index * 0.05}>
                    <div id={service.id} className="scroll-mt-24">
                      {index > 0 && <Separator className="mb-20" />}
                      <div className="flex flex-col gap-8">
                        {/* Service Header */}
                        <div className="flex flex-col gap-4 max-w-2xl">
                          <span className="text-xs font-medium text-[hsl(var(--color-accent))] tabular-nums">
                            {service.number}
                          </span>
                          <h2 className="font-semibold tracking-tight">
                            {service.title}
                          </h2>
                          <p className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide">
                            {service.tagline}
                          </p>
                          <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed mt-2">
                            {service.description}
                          </p>
                        </div>

                        {/* Includes as pills */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {service.includes.map((item) => (
                            <span
                              key={item}
                              className="px-3 py-1.5 text-sm rounded-full bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))] border border-[hsl(var(--color-border))]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </Container>
          </Section>

          {/* How We Work */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel label="Process" />
                    <h2 className="font-semibold tracking-tight">
                      How we work
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  {workProcess.map((step) => (
                    <StaggeredItem key={step.title}>
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold text-[hsl(var(--color-accent))] tabular-nums">
                          {step.number}
                        </span>
                        <h3 className="font-semibold tracking-tight">{step.title}</h3>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
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
                      Ready to start a project?
                    </h2>
                    <p className="text-[hsl(var(--color-foreground-muted))] text-lg leading-relaxed">
                      Tell us about what you&apos;re building. We&apos;ll see if
                      we&apos;re the right fit.
                    </p>
                    <Button size="lg" className="mt-2" asChild>
                      <Link href="/contact">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Get in touch
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
                            Let&apos;s connect
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
