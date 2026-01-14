"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionLabel } from "@/components/ui/section-label";

// Process steps - minimal, impactful
const processSteps = [
  { number: "01", title: "Discover", accent: "Research & Strategy" },
  { number: "02", title: "Design", accent: "Systems & Interface" },
  { number: "03", title: "Build", accent: "Code & Iterate" },
  { number: "04", title: "Evolve", accent: "Launch & Scale" },
];

// Split text animation component
function SplitText({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.03,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

// Animated number with count-up effect
function AnimatedNumber({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      ref={ref}
      className="tabular-nums"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.34, 1.56, 0.64, 1], // Spring effect
      }}
    >
      {value}
    </motion.span>
  );
}

// Process step with glassmorphism and 3D tilt
function ProcessStep({
  step,
  index,
}: {
  step: (typeof processSteps)[0];
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {/* Card with glassmorphism */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative p-5 rounded-2xl transition-all duration-300 ease-out cursor-default
          bg-[hsl(var(--color-background))]/80 backdrop-blur-sm
          border border-[hsl(var(--color-border))]
          group-hover:border-[hsl(var(--color-accent))]/50
          group-hover:shadow-[0_8px_32px_-8px_hsl(var(--color-accent)/0.15)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Gradient glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[hsl(var(--color-accent))]/5 via-transparent to-[hsl(var(--color-accent))]/10" />

        {/* Content */}
        <div className="relative z-10">
          {/* Number - large, accent colored */}
          <div className="text-3xl font-bold text-[hsl(var(--color-accent))] mb-3">
            <AnimatedNumber value={step.number} delay={index * 0.15 + 0.2} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold tracking-tight mb-1">
            {step.title}
          </h3>

          {/* Accent text */}
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
            {step.accent}
          </p>
        </div>

        {/* Animated corner accent */}
        <motion.div
          className="absolute -bottom-px -right-px w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <path
              d="M48 48 L48 24 Q48 48 24 48 Z"
              fill="hsl(var(--color-accent))"
              fillOpacity="0.1"
            />
          </svg>
        </motion.div>
      </div>

      {/* Connector line (except last) */}
      {index < processSteps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8">
          <motion.div
            className="h-px bg-gradient-to-r from-[hsl(var(--color-border))] to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
            style={{ originX: 0 }}
          />
        </div>
      )}
    </motion.div>
  );
}

// SVG animated line
function AnimatedConnectorLine() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      ref={ref}
      className="absolute top-[52px] left-0 w-full h-1 hidden lg:block pointer-events-none"
      preserveAspectRatio="none"
    >
      <motion.line
        x1="10%"
        y1="50%"
        x2="90%"
        y2="50%"
        stroke="hsl(var(--color-border))"
        strokeWidth="1"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1.5,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

export function ApproachProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <div ref={sectionRef}>
      <Section spacing="md" className="relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: prefersReducedMotion ? 0 : bgY }}
        >
          {/* Primary gradient blob */}
          <motion.div
            className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--color-accent) / 0.08) 0%, transparent 70%)",
              opacity: prefersReducedMotion ? 0.5 : bgOpacity,
            }}
          />
          {/* Secondary accent */}
          <div
            className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--color-accent)) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        <Container className="relative z-10">
          {/* Compact two-row layout */}
          <div className="flex flex-col gap-10">
            {/* Row 1: Header - Split into two parts */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Left: Label + Headline */}
              <div className="flex flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <SectionLabel number="03" label="How we work" />
                </motion.div>

                {/* Animated headline */}
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]">
                  <SplitText delay={0.1}>Not a vendor.</SplitText>{" "}
                  <span className="text-[hsl(var(--color-foreground-muted))]">
                    <SplitText delay={0.4}>A partner.</SplitText>
                  </span>
                </h2>
              </div>

              {/* Right: Supporting text + pills */}
              <motion.div
                className="flex flex-col gap-4 lg:items-end lg:text-right max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                  One team, strategy to deployment. Systems built to grow with you.
                </p>

                {/* Animated pills */}
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {["First principles", "No handoffs", "Long-term"].map(
                    (item, i) => (
                      <motion.span
                        key={item}
                        className="px-3 py-1 text-xs font-medium rounded-full
                          bg-[hsl(var(--color-background-subtle))]
                          border border-[hsl(var(--color-border))]
                          text-[hsl(var(--color-foreground-muted))]
                          hover:border-[hsl(var(--color-accent))]/50
                          hover:text-[hsl(var(--color-accent))]
                          transition-colors duration-300"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: 0.5 + i * 0.1,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      >
                        {item}
                      </motion.span>
                    )
                  )}
                </div>
              </motion.div>
            </div>

            {/* Row 2: Process steps with animated connector */}
            <div className="relative">
              <AnimatedConnectorLine />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {processSteps.map((step, index) => (
                  <ProcessStep key={step.number} step={step} index={index} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
