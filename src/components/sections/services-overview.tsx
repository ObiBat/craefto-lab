"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection } from "@/components/ui/motion";
import { services } from "@/lib/constants";

function AccordionItem({
  service,
  index,
  isOpen,
  onToggle,
}: {
  service: typeof services[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="border-b border-[hsl(var(--color-border))]">
      <button
        onClick={onToggle}
        className="w-full py-6 sm:py-8 flex items-center gap-4 sm:gap-8 text-left group transition-colors"
        aria-expanded={isOpen}
      >
        {/* Number */}
        <span className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] tabular-nums w-8 shrink-0">
          {number}
        </span>

        {/* Title */}
        <h3 className="flex-1 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
          {service.title}
        </h3>

        {/* Toggle Icon - green accent on hover */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[hsl(var(--color-border))] flex items-center justify-center shrink-0 transition-colors group-hover:border-[hsl(var(--color-accent))] group-hover:bg-[hsl(var(--color-accent))] group-hover:text-white"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v12m6-6H6"
            />
          </svg>
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-12 sm:pl-16 pb-8 sm:pb-10 pr-4 sm:pr-8 -mx-4 sm:-mx-8 px-4 sm:px-8 bg-[hsl(var(--color-accent-subtle))]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-6">
                {/* Description */}
                <div className="flex flex-col gap-4">
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-md">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-accent))] transition-colors group/link"
                  >
                    Learn more
                    <svg
                      className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
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
                  </Link>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
                  {service.capabilities?.map((capability) => (
                    <span
                      key={capability}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground-muted))] bg-[hsl(var(--color-background))] whitespace-nowrap"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ServicesOverview() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-14">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <SectionLabel number="01" label="Services" />
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold tracking-tight">
                    What we build
                  </h2>
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-3">
                    End-to-end capabilities from brand to product.
                  </p>
                </div>
                <Link
                  href="/services"
                  className="text-sm text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors group flex items-center gap-2 shrink-0"
                >
                  View all services
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
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Services Accordion */}
          <AnimatedSection>
            <div className="border-t border-[hsl(var(--color-border))]">
              {services.map((service, index) => (
                <AccordionItem
                  key={service.title}
                  service={service}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </Section>
  );
}
