"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection } from "@/components/ui/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/constants";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function ServiceIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "brand":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case "web":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "product":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "ai":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "security":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}

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

        {/* Title + Badge */}
        <div className="flex-1 flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            {service.title}
          </h3>
          {service.badge && (
            <Badge variant="accent" className="hidden sm:inline-flex">
              {service.badge}
            </Badge>
          )}
        </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pt-6">
                {/* Description + CTA */}
                <div className="flex flex-col gap-5 lg:col-span-1">
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Pricing & Timeline */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[hsl(var(--color-foreground-subtle))]">Starting from</span>
                      <span className="font-semibold text-[hsl(var(--color-foreground))]">
                        {formatPrice(service.startingPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[hsl(var(--color-foreground-subtle))]">Typical timeline</span>
                      <span className="font-medium text-[hsl(var(--color-foreground))]">
                        {service.timeline}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button size="sm" asChild>
                      <Link href={`/contact?service=${service.icon}`}>
                        Get a quote
                      </Link>
                    </Button>
                    <Link
                      href={service.href}
                      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors py-2"
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
                </div>

                {/* Capabilities */}
                <div className="lg:col-span-2 flex flex-wrap items-start content-start justify-start lg:justify-end gap-2">
                  {service.capabilities?.map((capability) => (
                    <span
                      key={capability}
                      className="px-3 py-1.5 text-sm font-medium rounded-full border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground-muted))] bg-[hsl(var(--color-background))] whitespace-nowrap"
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
