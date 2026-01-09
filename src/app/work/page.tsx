"use client";

import Link from "next/link";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Badge, Separator, PageTransition, AnimatedSection, StaggeredGrid, StaggeredItem, HeroText, ProjectImagePlaceholder } from "@/components/ui";

// Projects data - in production, this would come from a CMS or data file
const projects = [
  {
    slug: "fontkin",
    title: "Fontkin",
    description: "Professional font pairing lab for designers & developers with curated combinations and one-click exports.",
    category: "Web",
    industry: "Design Tools",
    year: 2024,
    featured: true,
    accentColor: "0 0% 6%",
  },
  {
    slug: "globfam",
    title: "GlobFam",
    description: "Cross-border family finance platform with premium branding & motion design system.",
    category: "Brand",
    industry: "Fintech / Family Finance",
    year: 2025,
    featured: true,
    accentColor: "195 78% 38%",
  },
  {
    slug: "tactix",
    title: "TACTIX",
    description: "The world's most beautiful 3D chess learning platform with AI-powered coaching.",
    category: "Product",
    industry: "EdTech / Gaming",
    year: 2025,
    featured: true,
    accentColor: "45 61% 52%",
  },
  {
    slug: "nuu",
    title: "NUU",
    description: "AI-powered property matching platform for the Australian rental market.",
    category: "SaaS",
    industry: "PropTech / Real Estate",
    year: 2025,
    featured: true,
    accentColor: "18 100% 50%",
  },
];

export default function WorkPage() {
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-16">
          {/* Hero */}
          <Section spacing="xs">
            <Container>
              <div className="max-w-3xl">
                <HeroText>
                  <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
                    Work
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    A selection of projects across brand, web, and product. Each one
                    built as a system, not a one-off.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Projects Grid */}
          <Section spacing="md">
            <Container>
              <Separator className="mb-12" />

              <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {projects.map((project) => (
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
                        <h2 className="text-xl font-semibold tracking-tight">
                          <span className="animated-underline">{project.title}</span>
                        </h2>
                        <p className="text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                          {project.description}
                        </p>
                        <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                          {project.industry}
                        </p>
                      </div>
                    </Link>
                  </StaggeredItem>
                ))}
              </StaggeredGrid>

              {/* Coming Soon Note */}
              <AnimatedSection className="mt-16" variant="fadeIn">
                <div className="p-8 rounded-xl border border-dashed border-[hsl(var(--color-border))] text-center">
                  <p className="text-[hsl(var(--color-foreground-muted))]">
                    More case studies coming soon. We&apos;re currently documenting
                    our recent projects.
                  </p>
                </div>
              </AnimatedSection>
            </Container>
          </Section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
