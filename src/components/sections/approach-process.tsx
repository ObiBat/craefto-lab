"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection } from "@/components/ui/motion";

// Streamlined process - 4 clear steps
const processSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Questions before assumptions",
  },
  {
    number: "02",
    title: "Design",
    description: "Systems before pixels",
  },
  {
    number: "03",
    title: "Build",
    description: "Design + code, unified",
  },
  {
    number: "04",
    title: "Evolve",
    description: "Launch is just the start",
  },
];

// Process step - minimal, elegant
function ProcessStep({
  step,
  index,
  isLast
}: {
  step: typeof processSteps[0];
  index: number;
  isLast: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative flex-1"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Step content */}
      <div className="relative">
        {/* Number + Title row */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-sm font-medium text-[hsl(var(--color-accent))] tabular-nums">
            {step.number}
          </span>
          <h3 className="text-lg font-semibold tracking-tight">
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-[hsl(var(--color-foreground-muted))] pl-8">
          {step.description}
        </p>
      </div>

      {/* Connector line (not on last item) */}
      {!isLast && (
        <div className="hidden md:block absolute top-3 left-full w-full h-px bg-gradient-to-r from-[hsl(var(--color-border))] to-transparent" />
      )}
    </motion.div>
  );
}

export function ApproachProcess() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section spacing="md" className="relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(var(--color-accent)) 0%, transparent 70%)",
          }}
        />
      </div>

      <Container className="relative z-10">
        {/* Two-column layout: Left = messaging, Right = process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left column - Core message */}
          <div className="lg:col-span-5">
            <AnimatedSection>
              <div className="flex flex-col gap-5">
                <SectionLabel number="03" label="How we work" />

                {/* Headline */}
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                  Not a vendor.{" "}
                  <span className="text-[hsl(var(--color-foreground-muted))]">
                    A partner.
                  </span>
                </h2>

                {/* Supporting text - concise */}
                <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-md">
                  One team from strategy to deployment. We build systems
                  designed to evolve with you.
                </p>

                {/* Key differentiators - inline pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {["First principles", "No handoffs", "Long-term focus"].map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground-muted))]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right column - Process flow */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {processSteps.map((step, index) => (
                <ProcessStep
                  key={step.number}
                  step={step}
                  index={index}
                  isLast={index === processSteps.length - 1}
                />
              ))}
            </div>
          </div>

        </div>
      </Container>
    </Section>
  );
}
