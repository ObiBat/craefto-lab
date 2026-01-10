"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";
import { ProjectImagePlaceholder } from "@/components/ui/project-image-placeholder";

// Featured projects for homepage (show top 3)
const featuredProjects = [
  {
    slug: "globfam",
    title: "GlobFam",
    description: "Cross-border family finance platform with premium branding & motion design system.",
    category: "Brand",
    year: 2025,
    accentColor: "195 78% 38%",
  },
  {
    slug: "tactix",
    title: "TACTIX",
    description: "The world's most beautiful 3D chess learning platform with AI-powered coaching.",
    category: "Product",
    year: 2025,
    accentColor: "45 61% 52%",
  },
  {
    slug: "nuu",
    title: "NUU",
    description: "AI-powered property matching platform for the Australian rental market.",
    category: "SaaS",
    year: 2025,
    accentColor: "18 100% 50%",
  },
];

export function SelectedWork() {
  return (
    <Section spacing="lg">
      <Container>
        <div className="flex flex-col gap-14">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <SectionLabel number="03" label="Case studies" />
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold tracking-tight">
                    Featured case studies
                  </h2>
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-3">
                    Recent projects for founders building the future.
                  </p>
                </div>
                <Link
                  href="/work"
                  className="text-sm text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors group flex items-center gap-2 shrink-0"
                >
                  All case studies
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

          {/* Projects Grid */}
          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProjects.map((project) => (
              <StaggeredItem key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] rounded-xl mb-5 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
                    <ProjectImagePlaceholder
                      projectName={project.title}
                      imageType="thumb"
                      accentColor={project.accentColor}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{project.category}</Badge>
                      <span className="text-sm text-[hsl(var(--color-foreground-subtle))]">{project.year}</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      <span className="animated-underline">{project.title}</span>
                    </h3>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                      {project.description}
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
