"use client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";
import { processSteps } from "@/lib/constants";

export function Process() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-12">
          {/* Header */}
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              How we work
            </h2>
          </AnimatedSection>

          <Separator />

          {/* Process Steps */}
          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {processSteps.map((step) => (
              <StaggeredItem key={step.number}>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] flex items-center justify-center">
                    <span className="text-sm font-medium text-[hsl(var(--color-foreground-muted))]">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </div>
      </Container>
    </Section>
  );
}
