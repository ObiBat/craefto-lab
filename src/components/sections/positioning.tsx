"use client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";
import { positioningPoints } from "@/lib/constants";

export function Positioning() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-14">
          {/* Intro */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <SectionLabel number="01" label="Approach" />
              <h2 className="font-semibold tracking-tight">
                Not a vendor.{" "}
                <span className="text-[hsl(var(--color-foreground-muted))]">
                  A partner.
                </span>
              </h2>
              <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-2xl leading-relaxed mt-2">
                We embed with your team to build systems that grow with you.
              </p>
            </div>
          </AnimatedSection>

          <Separator />

          {/* Points Grid */}
          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {positioningPoints.map((point) => (
              <StaggeredItem key={point.number}>
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-medium text-[hsl(var(--color-accent))] tabular-nums">
                    {point.number}
                  </span>
                  <h3 className="font-semibold tracking-tight">
                    {point.title}
                  </h3>
                  <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </div>
      </Container>
    </Section>
  );
}
