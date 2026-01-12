"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";

// Approach pillars data
const approachPillars = [
  {
    id: "systems",
    title: "Systems, not templates",
    description:
      "Every project is built from first principles — tailored to your goals, not pulled from a library.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    id: "unified",
    title: "Design + engineering",
    description:
      "One team, one vision. No handoffs, no lost context. Strategy to deployment, unified.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    id: "partners",
    title: "Long-term partners",
    description:
      "We build foundations, not quick fixes. Our work is designed to evolve with you.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

// Process steps data
const processSteps = [
  {
    number: "01",
    title: "Understand",
    description:
      "We start with questions, not assumptions. What are you building? Who is it for? What does success look like?",
    duration: "1-2 weeks",
  },
  {
    number: "02",
    title: "Design the system",
    description:
      "Before pixels, we map the structure. Information architecture, user flows, and technical decisions all aligned.",
    duration: "2-4 weeks",
  },
  {
    number: "03",
    title: "Build with precision",
    description:
      "Design and development happen together. Every component is intentional, every interaction considered.",
    duration: "4-8 weeks",
  },
  {
    number: "04",
    title: "Evolve",
    description:
      "Launch is the beginning. We build foundations that grow with you.",
    duration: "Ongoing",
  },
];

// Animated background shape
function FloatingShape({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className} />;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Process step card with hover effect
function ProcessStepCard({ step, index }: { step: typeof processSteps[0]; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative"
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="relative p-6 sm:p-8 rounded-2xl bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] transition-all duration-300 group-hover:border-[hsl(var(--color-accent))] group-hover:shadow-lg overflow-hidden">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-accent-subtle))] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Number badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] text-lg font-semibold text-[hsl(var(--color-accent))] transition-colors duration-300 group-hover:bg-[hsl(var(--color-accent))] group-hover:text-white group-hover:border-[hsl(var(--color-accent))]">
              {step.number}
            </span>
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wider">
              {step.duration}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold tracking-tight mb-3">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[hsl(var(--color-accent))]" style={{ opacity: 0.1 }}>
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Connection line (except last) */}
      {index < processSteps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-[hsl(var(--color-border))]" />
      )}
    </motion.div>
  );
}

// Approach pillar card
function ApproachPillarCard({ pillar }: { pillar: typeof approachPillars[0] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="group"
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="h-full p-6 sm:p-8 rounded-2xl bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border-subtle))] transition-all duration-300 group-hover:bg-[hsl(var(--color-accent-subtle))] group-hover:border-[hsl(var(--color-accent))]">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] flex items-center justify-center mb-5 text-[hsl(var(--color-foreground-muted))] transition-colors duration-300 group-hover:text-[hsl(var(--color-accent))] group-hover:border-[hsl(var(--color-accent))]">
          {pillar.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight mb-3">
          {pillar.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
          {pillar.description}
        </p>
      </div>
    </motion.div>
  );
}

export function ApproachProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax values for background elements
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div ref={sectionRef}>
    <Section spacing="lg" className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gradient blob - top right */}
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(var(--color-accent-subtle)) 0%, transparent 70%)",
            y: prefersReducedMotion ? 0 : bgY1,
          }}
        />

        {/* Smaller blob - bottom left */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--color-accent-subtle)) 0%, transparent 70%)",
            y: prefersReducedMotion ? 0 : bgY2,
          }}
        />

        {/* Geometric shapes */}
        <FloatingShape className="absolute top-1/4 right-[15%] w-3 h-3 rounded-full bg-[hsl(var(--color-accent))] opacity-20" />
        <FloatingShape className="absolute top-1/3 left-[10%] w-2 h-2 rounded-full bg-[hsl(var(--color-accent))] opacity-15" />
        <FloatingShape className="absolute bottom-1/4 right-[25%] w-4 h-4 rounded-full bg-[hsl(var(--color-accent))] opacity-10" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col gap-20 lg:gap-28">

          {/* ═══════════════════════════════════════════════════════════
             SECTION HEADER - Editorial style with large typography
             ═══════════════════════════════════════════════════════════ */}
          <AnimatedSection>
            <div className="flex flex-col gap-6 max-w-4xl">
              <SectionLabel number="03" label="How we work" />

              {/* Large headline with emphasis */}
              <h2 className="font-semibold tracking-tight">
                Not a vendor.{" "}
                <span className="text-[hsl(var(--color-foreground-muted))]">
                  A partner.
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-[hsl(var(--color-foreground-muted))] max-w-2xl leading-relaxed">
                We embed with your team to build systems that grow with you.
                A clear, collaborative process from discovery to delivery.
              </p>
            </div>
          </AnimatedSection>

          {/* ═══════════════════════════════════════════════════════════
             APPROACH PILLARS - Bento-style cards
             ═══════════════════════════════════════════════════════════ */}
          <div>
            <AnimatedSection delay={0.1}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-[hsl(var(--color-accent))]" />
                <span className="text-sm font-medium text-[hsl(var(--color-accent))] uppercase tracking-wider">
                  Our Approach
                </span>
              </div>
            </AnimatedSection>

            <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {approachPillars.map((pillar) => (
                <StaggeredItem key={pillar.id}>
                  <ApproachPillarCard pillar={pillar} />
                </StaggeredItem>
              ))}
            </StaggeredGrid>
          </div>

          {/* ═══════════════════════════════════════════════════════════
             PROCESS STEPS - Timeline-style cards
             ═══════════════════════════════════════════════════════════ */}
          <div>
            <AnimatedSection delay={0.1}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-[hsl(var(--color-accent))]" />
                <span className="text-sm font-medium text-[hsl(var(--color-accent))] uppercase tracking-wider">
                  The Process
                </span>
              </div>
            </AnimatedSection>

            <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" staggerDelay={0.1}>
              {processSteps.map((step, index) => (
                <StaggeredItem key={step.number}>
                  <ProcessStepCard step={step} index={index} />
                </StaggeredItem>
              ))}
            </StaggeredGrid>

            {/* Bottom accent line */}
            <AnimatedSection delay={0.5}>
              <div className="mt-12 pt-12 border-t border-[hsl(var(--color-border))]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-[hsl(var(--color-foreground-muted))]">
                    Ready to build something exceptional?
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-accent))] transition-colors group"
                  >
                    Start a conversation
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </Container>
    </Section>
    </div>
  );
}
