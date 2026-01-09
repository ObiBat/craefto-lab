"use client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";
import { positioningPoints } from "@/lib/constants";

export function Positioning() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-12">
          {/* Intro */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Not a vendor.{" "}
                <span className="text-[hsl(var(--color-foreground-muted))]">
                  A partner.
                </span>
              </h2>
            </div>
          </AnimatedSection>

          <Separator />

          {/* Points Grid */}
          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {positioningPoints.map((point) => (
              <StaggeredItem key={point.number}>
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))]">
                    {point.number}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">
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
