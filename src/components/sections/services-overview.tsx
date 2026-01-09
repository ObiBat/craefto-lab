"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";
import { services } from "@/lib/constants";

export function ServicesOverview() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-14">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <SectionLabel number="02" label="Services" />
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

          <Separator />

          {/* Services Grid */}
          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <StaggeredItem key={service.title}>
                <Link
                  href={service.href}
                  className="group block p-6 sm:p-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] transition-all duration-[var(--duration-normal)] hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold tracking-tight">
                        {service.title}
                      </h3>
                      <svg
                        className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))] transition-all group-hover:text-[hsl(var(--color-foreground))] group-hover:translate-x-1 shrink-0 mt-1"
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
                    </div>
                    <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </div>
      </Container>
    </Section>
  );
}
