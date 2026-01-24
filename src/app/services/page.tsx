"use client";

import Link from "next/link";
import { useState } from "react";
import { Header, Footer, Container, Section } from "@/components/layout";
import { PageTransition, AnimatedSection, HeroText } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "web",
    number: "01",
    title: "Web Design & Development",
    tagline: "Design and engineering as one",
    description:
      "Marketing sites, SaaS platforms, and dashboards built with precision. No handoffs, no lost context between design and code. We handle everything from information architecture to deployment.",
    includes: [
      "Information architecture & UX",
      "Visual design & prototyping",
      "Frontend development (React, Next.js)",
      "Backend & API development",
      "Payment integration (Stripe)",
      "Performance optimization",
    ],
    featured: true,
  },
  {
    id: "brand",
    number: "02",
    title: "Brand Identity",
    tagline: "Strategic foundations",
    description:
      "Brands that communicate clearly and design systems that maintain consistency across every touchpoint.",
    includes: [
      "Brand strategy & positioning",
      "Logo & visual identity",
      "Design system & components",
      "Brand guidelines",
    ],
    featured: false,
  },
  {
    id: "products",
    number: "03",
    title: "Digital Products",
    tagline: "From concept to launch",
    description:
      "MVPs, interactive experiences, and scalable platforms. Full-stack product development from scoping to deployment.",
    includes: [
      "Product strategy & scoping",
      "Full-stack development",
      "Interactive experiences & WebGL",
      "API integrations",
      "Workflow automation",
    ],
    featured: false,
  },
  {
    id: "ai",
    number: "04",
    title: "AI & Automation",
    tagline: "Intelligent systems",
    description:
      "Agents, workflows, and automation tools. Meaningful AI implementation that drives real outcomes.",
    includes: [
      "AI strategy & discovery",
      "Custom agent development",
      "LLM integrations",
      "Process automation",
    ],
    featured: false,
  },
  {
    id: "security",
    number: "05",
    title: "Security & Pen Testing",
    tagline: "We don't just build it, we secure it",
    description:
      "Enterprise-grade penetration testing and security audits, accessible to startups and SMEs. Web application assessments, compliance readiness, and actionable remediation — from $4,999 AUD.",
    includes: [
      "Web application security assessment",
      "Vulnerability report & remediation guide",
      "Executive summary (investor/board-ready)",
      "30-day re-test after fixes",
      "ISO 27001 & SOC 2 readiness",
      "Essential Eight compliance",
      "PCI-DSS assessment",
      "OSCP/CREST-certified testers",
    ],
    featured: false,
  },
];

const workProcess = [
  { number: "01", title: "Discovery", description: "Understand goals and constraints" },
  { number: "02", title: "Proposal", description: "Clear scope and investment" },
  { number: "03", title: "Execution", description: "Build in focused sprints" },
  { number: "04", title: "Launch", description: "Deploy and support" },
];

// Service Card Component
function ServiceCard({
  service,
  className,
  size = "default"
}: {
  service: typeof services[0];
  className?: string;
  size?: "featured" | "default";
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] overflow-hidden transition-all duration-300",
        "hover:border-[hsl(var(--color-accent))] hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "h-full flex flex-col",
        size === "featured" ? "p-8 lg:p-10" : "p-6 lg:p-8"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className={cn(
            "font-mono font-medium text-[hsl(var(--color-accent))]",
            size === "featured" ? "text-sm" : "text-xs"
          )}>
            {service.number}
          </span>
          <div className={cn(
            "w-2 h-2 rounded-full bg-[hsl(var(--color-accent))] transition-transform duration-300",
            isHovered ? "scale-150" : "scale-100"
          )} />
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-heading font-semibold tracking-tight text-[hsl(var(--color-foreground))] mb-2",
          size === "featured" ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"
        )}>
          {service.title}
        </h3>

        {/* Tagline */}
        <p className={cn(
          "text-[hsl(var(--color-accent))] font-medium uppercase tracking-wide mb-4",
          size === "featured" ? "text-sm" : "text-xs"
        )}>
          {service.tagline}
        </p>

        {/* Description */}
        <p className={cn(
          "text-[hsl(var(--color-foreground-muted))] leading-relaxed flex-grow",
          size === "featured" ? "text-base lg:text-lg mb-8" : "text-sm mb-6",
          size === "default" && "line-clamp-3 group-hover:line-clamp-none transition-all"
        )}>
          {service.description}
        </p>

        {/* Includes - Show on featured or hover */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          size === "featured"
            ? "opacity-100 max-h-[500px]"
            : isHovered
              ? "opacity-100 max-h-[300px]"
              : "opacity-0 max-h-0"
        )}>
          <div className="pt-4 border-t border-[hsl(var(--color-border))]">
            <p className="text-xs font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide mb-3">
              Includes
            </p>
            <div className="flex flex-wrap gap-2">
              {service.includes.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 text-xs rounded-full bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))] border border-[hsl(var(--color-border-subtle))]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow indicator - visible by default, animates on hover */}
        {size === "default" && (
          <div className={cn(
            "absolute bottom-6 right-6 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-1" : "opacity-40 translate-x-0"
          )}>
            <svg className="w-5 h-5 text-[hsl(var(--color-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// Process Step Component
function ProcessStep({ step, index }: { step: typeof workProcess[0]; index: number }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--color-accent))] flex items-center justify-center">
        <span className="text-xs font-semibold text-white">{step.number}</span>
      </div>
      <div>
        <h4 className="font-semibold text-[hsl(var(--color-foreground))] mb-1">{step.title}</h4>
        <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{step.description}</p>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const featuredService = services.find(s => s.featured)!;
  const otherServices = services.filter(s => !s.featured);

  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero - Compact */}
          <Section spacing="sm" className="pb-8 md:pb-10">
            <Container>
              <div className="max-w-3xl">
                <nav className="mb-6" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                    <li>
                      <Link href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">
                        Home
                      </Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li className="text-[hsl(var(--color-foreground))] font-medium">Services</li>
                  </ol>
                </nav>

                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-4">
                    Services
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    Tailored systems, not templates. Each project approached from first principles.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Bento Grid */}
          <Section spacing="sm" className="pt-0">
            <Container>
              <AnimatedSection>
                {/* Desktop Bento Grid */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto] gap-4 lg:gap-5">
                  {/* Featured Service - Large Card */}
                  <ServiceCard
                    service={featuredService}
                    size="featured"
                    className="lg:col-span-7 lg:row-span-2 min-h-[480px]"
                  />

                  {/* Other Services - 2x2 Grid */}
                  <ServiceCard
                    service={otherServices[0]}
                    className="lg:col-span-5 min-h-[230px]"
                  />
                  <ServiceCard
                    service={otherServices[1]}
                    className="lg:col-span-5 min-h-[230px]"
                  />
                </div>

                {/* Second Row */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 lg:gap-5 mt-4 lg:mt-5">
                  <ServiceCard
                    service={otherServices[2]}
                    className="lg:col-span-4 min-h-[220px]"
                  />
                  <ServiceCard
                    service={otherServices[3]}
                    className="lg:col-span-4 min-h-[220px]"
                  />

                  {/* Process Card */}
                  <div className="lg:col-span-4 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] p-6 lg:p-8 min-h-[220px]">
                    <p className="text-xs font-medium text-[hsl(var(--color-accent))] uppercase tracking-wide mb-5">
                      How We Work
                    </p>
                    <div className="space-y-4">
                      {workProcess.map((step, index) => (
                        <div key={step.title} className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--color-accent))] flex items-center justify-center text-[10px] font-semibold text-white">
                            {step.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-[hsl(var(--color-foreground))]">{step.title}</span>
                            <span className="text-[hsl(var(--color-foreground-muted))] text-sm"> · {step.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Layout - Stacked Cards (all collapsed by default) */}
                <div className="lg:hidden space-y-4">
                  {/* Featured service shown as default card on mobile */}
                  <ServiceCard
                    service={featuredService}
                    size="default"
                  />
                  {otherServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                    />
                  ))}

                  {/* Mobile Process */}
                  <div className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] p-6">
                    <p className="text-xs font-medium text-[hsl(var(--color-accent))] uppercase tracking-wide mb-5">
                      How We Work
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {workProcess.map((step) => (
                        <div key={step.title} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--color-accent))] flex items-center justify-center text-[10px] font-semibold text-white">
                            {step.number}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-[hsl(var(--color-foreground))]">{step.title}</p>
                            <p className="text-xs text-[hsl(var(--color-foreground-muted))]">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* CTA */}
          <Section spacing="md" className="pt-8 md:pt-12">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-8 sm:p-10 lg:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="max-w-xl">
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight !text-white mb-2">
                        Ready to start?
                      </h2>
                      <p className="text-white/80 text-base lg:text-lg leading-relaxed">
                        Tell us about what you&apos;re building. We&apos;ll see if we&apos;re the right fit.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="!bg-white !text-[hsl(var(--color-accent))] hover:!bg-[hsl(var(--color-foreground))] hover:!text-white flex-shrink-0"
                      asChild
                    >
                      <Link href="/contact">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Get in touch
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                          <span className="btn-text-secondary" aria-hidden="true">
                            Let&apos;s connect
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
