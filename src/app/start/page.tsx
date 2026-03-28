"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText, SectionLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";

const phases = [
  {
    number: "01",
    title: "Discovery",
    note: "Free 30 min call",
    items: [
      "Understand your goals and vision",
      "Research your market and competitors",
      "Define success metrics together",
    ],
  },
  {
    number: "02",
    title: "Design",
    note: "Collaborative process",
    items: [
      "Information architecture and structure",
      "Wireframes and visual design",
      "Client review and iteration",
    ],
  },
  {
    number: "03",
    title: "Build",
    note: "One team, start to finish",
    items: [
      "Frontend and backend development",
      "Integrations and third party services",
      "Testing and quality assurance",
    ],
  },
  {
    number: "04",
    title: "Launch & Grow",
    note: "Ongoing partnership",
    items: [
      "Deployment and go live",
      "Analytics and performance monitoring",
      "30 day support and ongoing optimization",
    ],
  },
];

const serviceLinks = [
  { title: "Web Design & Development", href: "/services#web" },
  { title: "Brand Identity", href: "/services#brand" },
  { title: "Digital Products", href: "/services#products" },
  { title: "AI & Automation", href: "/services#ai" },
  { title: "Security & Pen Testing", href: "/services#security" },
];

export default function StartPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="sm" className="pb-8 md:pb-6">
            <Container>
              <div className="max-w-3xl">
                <nav className="mb-6 md:mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                    <li>
                      <Link href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">
                        Home
                      </Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li className="text-[hsl(var(--color-foreground))] font-medium">First Time Here</li>
                  </ol>
                </nav>

                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-4">
                    New here? Let us introduce ourselves.
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-xl">
                    We&apos;re a small, focused team in Sydney that designs and builds digital products for businesses that care about quality.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Section 01: Who We Are */}
          <Section spacing="lg" className="pt-0 md:pt-0">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="01" label="Who We Are" />
                    <h2 className="font-semibold tracking-tight">
                      Design, code, and strategy under one roof
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Small team, full capability.</strong> We handle design, engineering, and strategy as one continuous conversation. No handoffs between departments, no lost context, no surprises.
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        <strong className="text-[hsl(var(--color-foreground))]">Founded by Obi Batbileg,</strong> a design technologist who builds at the intersection of design, engineering, and systems thinking. Based in Sydney, working globally.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Section 02: Our Promise */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="02" label="Our Promise" />
                    <h2 className="font-semibold tracking-tight">
                      We start with dialogue
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        You don&apos;t need a polished brief or a clear direction. Many clients come to us with just an idea, a frustration, or a goal they can&apos;t quite articulate.
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        We help organize your thinking before we start building. Our first conversation is about understanding what matters to you, not selling you a package.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Section 03: What Makes Us Different */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="03" label="What Makes Us Different" />
                    <h2 className="font-semibold tracking-tight">
                      One team, one conversation, start to finish
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        We handle strategy, design, and development as one continuous process. Most agencies split these across teams or outsource parts. We don&apos;t.
                      </p>
                    </div>
                    <div className="space-y-6 text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      <p>
                        We also bring security and AI expertise, which means the things we build are both beautiful and robust. You get a complete solution, not a patchwork of vendors.
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </Container>
          </Section>

          {/* Section 04: How It Works */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="04" label="How It Works" />
                    <h2 className="font-semibold tracking-tight">
                      Four phases, no surprises
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {phases.map((phase) => (
                    <StaggeredItem key={phase.title}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--color-accent))] flex items-center justify-center text-xs font-semibold text-white">
                            {phase.number}
                          </span>
                          <h3 className="font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
                            {phase.title}
                          </h3>
                        </div>
                        <p className="text-xs font-medium text-[hsl(var(--color-accent))] uppercase tracking-wide">
                          {phase.note}
                        </p>
                        <ul className="space-y-2">
                          {phase.items.map((item) => (
                            <li key={item} className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-[hsl(var(--color-accent))] mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* Section 05: What We Build */}
          <Section spacing="lg">
            <Container>
              <div className="flex flex-col gap-14 md:gap-10">
                <AnimatedSection>
                  <div className="flex flex-col gap-4">
                    <SectionLabel number="05" label="What We Build" />
                    <h2 className="font-semibold tracking-tight">
                      From brands to platforms
                    </h2>
                  </div>
                </AnimatedSection>

                <Separator />

                <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceLinks.map((service) => (
                    <StaggeredItem key={service.title}>
                      <Link
                        href={service.href}
                        className="group flex items-center justify-between p-5 rounded-xl border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-accent))] transition-all duration-300"
                      >
                        <span className="font-medium text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-accent))] transition-colors">
                          {service.title}
                        </span>
                        <svg className="w-4 h-4 text-[hsl(var(--color-foreground-muted))] group-hover:text-[hsl(var(--color-accent))] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </StaggeredItem>
                  ))}
                </StaggeredGrid>
              </div>
            </Container>
          </Section>

          {/* Section 06: Start a Conversation CTA */}
          <Section spacing="lg" className="pt-8 md:pt-12">
            <Container>
              <AnimatedSection>
                <div className="flex flex-col gap-4 mb-10">
                  <SectionLabel number="06" label="Start a Conversation" />
                </div>
              </AnimatedSection>
              <AnimatedSection variant="scaleIn">
                <div className="rounded-2xl bg-[hsl(var(--color-accent))] p-10 sm:p-14 md:p-16">
                  <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                    <h2 className="font-semibold tracking-tight !text-white">
                      You don&apos;t need to have everything figured out.
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                      Just tell us what you are thinking about, and we will take it from there. No pressure, no commitment, just a conversation.
                    </p>
                    <Button size="lg" variant="secondary" className="mt-2 !bg-white !text-[hsl(var(--color-accent))] hover:!bg-[hsl(var(--color-foreground))] hover:!text-white" asChild>
                      <Link href="/contact">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Get in touch
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
