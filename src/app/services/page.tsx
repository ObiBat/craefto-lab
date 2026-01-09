"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText } from "@/components/ui";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "brand",
    title: "Brand Identity & Design Systems",
    description:
      "Strategic foundations and visual systems that scale with your business. We create brands that communicate clearly and design systems that maintain consistency across every touchpoint.",
    includes: [
      "Brand strategy & positioning",
      "Logo & visual identity",
      "Design system & component library",
      "Brand guidelines documentation",
      "Asset creation & templates",
    ],
  },
  {
    id: "web",
    title: "Web Design & Development",
    description:
      "Marketing sites, SaaS platforms, and dashboards built for performance. Design and development as one unified process with no handoffs and no lost context.",
    includes: [
      "Information architecture & UX",
      "Visual design & prototyping",
      "Frontend development (React, Next.js)",
      "CMS integration",
      "Performance optimization",
    ],
  },
  {
    id: "creative",
    title: "Creative-Tech Products",
    description:
      "Interactive experiences, 3D, and experimental web work. For brands that want to push boundaries and create memorable digital moments.",
    includes: [
      "Interactive storytelling",
      "3D & WebGL experiences",
      "Generative & data-driven art",
      "Experimental interfaces",
      "Campaign microsites",
    ],
  },
  {
    id: "saas",
    title: "SaaS & Internal Tools",
    description:
      "MVPs, client portals, and automation systems. We help you build the tools your business needs, whether customer facing or internal operations.",
    includes: [
      "Product strategy & scoping",
      "UI/UX design",
      "Full-stack development",
      "Database architecture",
      "API integrations",
    ],
  },
  {
    id: "ai",
    title: "AI-Powered Systems",
    description:
      "Workflows, agents, and intelligence tools for modern teams. We help you leverage AI meaningfully, not as a buzzword but as a genuine force multiplier.",
    includes: [
      "AI strategy & use case discovery",
      "Custom agent development",
      "Workflow automation",
      "LLM integrations",
      "Internal knowledge systems",
    ],
  },
];

const workProcess = [
  {
    title: "Discovery",
    description:
      "We start with a conversation to understand your goals, context, and constraints. No assumptions, just questions.",
  },
  {
    title: "Proposal",
    description:
      "Based on discovery, we provide a clear scope, timeline, and investment. Transparent and straightforward.",
  },
  {
    title: "Execution",
    description:
      "Design and build in focused sprints with regular check-ins. You're involved throughout, not just at the end.",
  },
  {
    title: "Launch & Support",
    description:
      "We deploy, test, and support your project post-launch. The relationship doesn't end at delivery.",
  },
];

export default function ServicesPage() {
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
                    Services
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    We build tailored systems, not templates. Each project is
                    approached from first principles, designed for your specific
                    goals.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Services List */}
          <Section spacing="md">
            <Container>
              <div className="flex flex-col gap-16">
                {services.map((service, index) => (
                  <AnimatedSection key={service.id} delay={index * 0.05}>
                    <div id={service.id}>
                      {index > 0 && <Separator className="mb-16" />}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
                            {service.title}
                          </h2>
                          <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide mb-4">
                            What&apos;s included
                          </h3>
                          <ul className="space-y-3">
                            {service.includes.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-3 text-[hsl(var(--color-foreground-muted))]"
                              >
                                <svg
                                  className="w-5 h-5 text-[hsl(var(--color-accent))] mt-0.5 flex-shrink-0"
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
                                {item}
                              </li>
                            ))}
                          </ul>
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
              <div className="flex flex-col gap-12">
                <AnimatedSection>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    How we work
                  </h2>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {workProcess.map((step, index) => (
                    <StaggeredItem key={step.title}>
                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
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
