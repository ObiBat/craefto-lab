"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Badge, Separator, PageTransition, AnimatedSection, HeroText, StaggeredGrid, StaggeredItem, ProjectImagePlaceholder } from "@/components/ui";
import { Button } from "@/components/ui/button";

// TypeScript interfaces for case study data
interface Metric {
  label: string;
  value: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  category: "Brand" | "Web" | "Product" | "SaaS" | "Creative";
  client: string;
  industry: string;
  timeline: string;
  year: number;
  featured: boolean;
  services: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  challenge: string;
  approach: string;
  solution: string;
  outcome: string;
  heroImage: string;
  thumbnail: string;
  gallery: GalleryImage[];
  metrics?: Metric[];
  testimonial?: Testimonial;
  awards?: string[];
  accentColor?: string;
}

// Helper component to render real image or placeholder
function ProjectImage({
  project,
  src,
  alt,
  caption,
  imageType = "gallery",
  className = "",
}: {
  project: CaseStudy;
  src?: string;
  alt?: string;
  caption?: string;
  imageType?: "hero" | "gallery" | "thumb";
  className?: string;
}) {
  // Check if this project has real images
  const projectsWithRealImages = ["tactix", "nuu", "fontkin", "globfam"];
  const hasRealImages = projectsWithRealImages.includes(project.slug) && src?.includes("/images/projects/");

  if (hasRealImages && src) {
    return (
      <Image
        src={src}
        alt={alt || `${project.title} ${imageType}`}
        fill
        className={`object-cover ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
    );
  }

  return (
    <ProjectImagePlaceholder
      projectName={project.title}
      imageType={imageType}
      caption={caption || ""}
      accentColor={project.accentColor}
    />
  );
}

// Project data - in production, this would come from a CMS
const projects: CaseStudy[] = [
  {
    slug: "fontkin",
    title: "Fontkin",
    description: "Professional font pairing lab for designers & developers with curated combinations and one-click exports.",
    category: "Web",
    client: "Internal Project",
    industry: "Design Tools",
    timeline: "Ongoing",
    year: 2024,
    featured: true,
    services: ["Brand Strategy", "UI/UX Design", "Design System", "Frontend Development", "SEO Implementation"],
    techStack: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Google Fonts", "Radix UI", "Vercel"],
    liveUrl: "https://fontkin.com",
    githubUrl: "https://github.com/ObiBat/fontkin",
    challenge: "Typography is one of the most impactful design decisions, yet designers and developers often waste hours guessing font pairings. Existing tools either generate random combinations without design intent, overwhelm users with thousands of options from Google Fonts, or lack practical developer exports. The challenge was to create a curated, opinionated tool that provides professional-quality typography decisions with real-world context and one-click implementation for modern development workflows.",
    approach: "Rather than building another random font generator, the approach focused on curation over quantity. Each of the 34 font pairings was hand-selected based on real design principles—contrast, x-height compatibility, mood alignment, and use-case appropriateness. The tool was designed around three key insights: designers need to see fonts in context (web UI, editorial, hero sections), developers need copy-paste-ready code, and both audiences benefit from smart filtering by mood and purpose.",
    solution: "Fontkin delivers a comprehensive font pairing experience with multiple preview modes (web UI, editorial layouts, hero sections), a custom combo builder with fine-grained typography controls (weight, size, line-height, letter-spacing), a side-by-side comparison tool for up to 3 pairings, and developer-friendly exports in 4 formats: CSS variables, Tailwind config, Google Fonts HTML, and AI prompts for design handoff.",
    outcome: "Fontkin provides an intuitive solution for typography decisions that saves designers hours of font exploration. The curated approach ensures every pairing is production-ready, while multiple preview modes let users confidently visualize fonts in context before committing. The one-click export system bridges the design-to-development gap, eliminating copy errors and format inconsistencies.",
    heroImage: "/images/projects/fontkin/fontkin-hero.jpg",
    thumbnail: "/images/projects/fontkin/fontkin-thumb.jpg",
    gallery: [
      { src: "/images/projects/fontkin/fontkin-gallery-01.jpg", alt: "Font pairing explorer", caption: "Explore 34 curated font pairings" },
      { src: "/images/projects/fontkin/fontkin-gallery-02.jpg", alt: "Custom combo builder", caption: "Build custom type systems" },
      { src: "/images/projects/fontkin/fontkin-gallery-03.jpg", alt: "Typography preview", caption: "See fonts in real context" },
    ],
    metrics: [
      { label: "Font Pairings", value: "34" },
      { label: "Fonts in Library", value: "57" },
      { label: "Export Formats", value: "4" },
      { label: "Preview Modes", value: "3" },
    ],
    accentColor: "0 0% 6%",
  },
  {
    slug: "globfam",
    title: "GlobFam",
    description: "Cross-border family finance platform with premium branding & motion design system.",
    category: "Brand",
    client: "GlobFam Financial Technologies Inc.",
    industry: "Fintech / Family Finance",
    timeline: "8 weeks",
    year: 2025,
    featured: true,
    services: ["Brand Strategy", "Logo Design", "Motion Design", "UI/UX Design", "Design System", "Frontend Development", "Backend Development"],
    techStack: ["Next.js 15", "TypeScript", "React 18", "Tailwind CSS v4", "Framer Motion", "Lenis", "Supabase", "Resend", "Radix UI"],
    liveUrl: "https://globfam.io",
    challenge: "GlobFam needed a complete brand identity from scratch for their cross-border family finance platform. The challenge was creating a visual language that conveyed trust and security (essential for fintech) while feeling warm, approachable, and family-oriented. The brand needed to resonate with diverse global families managing finances across borders, balancing professionalism with emotional connection. Additionally, the digital presence required premium motion design to differentiate from competitors.",
    approach: "The design process began with extensive research into the emotional journey of families managing cross-border finances, understanding the stress of international transfers, the joy of shared goals, and the need for transparency. The 6-petal flower logo was developed as a symbol of family unity (each petal representing a family member) and organic growth. The color palette draws from nature: ocean blues for trust, mint greens for growth, and soft creams for warmth. A comprehensive motion design language was created using spring physics and magnetic interactions.",
    solution: "Delivered a complete brand system including: A distinctive 6-petal thin-stroke flower logo with animated variants; a carefully curated 15-color palette with semantic meanings; a dual-font typography system (Sora + Manrope) with fluid scales; a motion design language with custom easing curves, spring physics, and 9+ reusable animation components; an interactive design system documentation page; and a production-ready landing page with glassmorphism UI, magnetic hover effects, and a functional email waitlist system.",
    outcome: "The brand identity successfully positions GlobFam as a premium, trustworthy fintech platform while maintaining warmth and approachability. The motion design system creates memorable interactions that differentiate the product. The magnetic CTA buttons and organic blur backgrounds have become signature brand elements. The design system documentation ensures consistency across future development.",
    heroImage: "/images/projects/globfam/globfam-hero.jpg",
    thumbnail: "/images/projects/globfam/globfam-thumb.jpg",
    gallery: [
      { src: "/images/projects/globfam/globfam-gallery-01.jpg", alt: "GlobFam logo proportion", caption: "6-petal flower logo with precise grid system" },
      { src: "/images/projects/globfam/globfam-gallery-02.jpg", alt: "Color palette", caption: "Primary palette: Blue, Charcoal, Ivory, Green" },
      { src: "/images/projects/globfam/globfam-gallery-03.mp4", alt: "Motion design system", caption: "Spring physics and magnetic interactions" },
    ],
    metrics: [
      { label: "Animations", value: "364+" },
      { label: "Brand Colors", value: "15" },
      { label: "Components", value: "80+" },
      { label: "Motion Components", value: "9" },
    ],
    testimonial: {
      quote: "The branding work exceeded our expectations. The 6-petal flower logo perfectly captures our mission of bringing families together financially. The attention to motion design details makes our product feel premium and trustworthy.",
      author: "Founder",
      role: "CEO",
      company: "GlobFam Financial Technologies Inc.",
    },
    accentColor: "195 78% 38%",
  },
  {
    slug: "tactix",
    title: "TACTIX",
    description: "The world's most beautiful 3D chess learning platform with AI-powered coaching.",
    category: "Product",
    client: "Internal Product",
    industry: "EdTech / Gaming",
    timeline: "Multi-phase",
    year: 2025,
    featured: true,
    services: ["Brand Strategy", "Design System", "UI/UX Design", "Frontend Development", "Backend Development", "3D Development", "AI Integration"],
    techStack: ["React 19", "TypeScript", "Three.js", "React Three Fiber", "Tailwind CSS", "Zustand", "Stockfish WASM", "Supabase", "Clerk", "Google Gemini", "WebSockets"],
    liveUrl: "",
    challenge: "The chess software market is dominated by outdated interfaces that feel clinical and uninspiring. Existing platforms prioritize function over form, missing the opportunity to make chess feel like the elegant, strategic art form it truly is. The challenge was to create a chess platform that could rival AAA game visuals while maintaining educational depth, essentially MasterClass meets Gran Turismo for chess.",
    approach: "We adopted a visual excellence first philosophy, building the 3D rendering system before the game logic to ensure the visual standard would never be compromised. We chose React Three Fiber for declarative 3D scene management, allowing rapid iteration on lighting, materials, and animations. For the chess engine, we implemented Stockfish WASM client-side, eliminating server costs and latency while enabling offline play.",
    solution: "TACTIX delivers a premium 3D chess experience with mahogany-framed boards, realistic Staunton pieces with lathe-turned geometries, and professional 3-point lighting with bloom and vignette post-processing effects. The Learning Academy features 25+ interactive lessons across beginner to advanced tracks. The Stockfish integration offers 5 difficulty levels with real-time position evaluation. The exam system uses Google Gemini to generate personalized coaching reports.",
    outcome: "TACTIX successfully demonstrates that chess software can achieve AAA visual quality while remaining performant across devices. The adaptive DPR and LOD systems maintain smooth framerates even on mobile. The local-first architecture with Supabase sync ensures progress is never lost while minimizing backend costs. The platform is positioned for global ranked matchmaking and premium cosmetics monetization.",
    heroImage: "/images/projects/tactix/tactix-hero.jpg",
    thumbnail: "/images/projects/tactix/tactix-thumb.jpg",
    gallery: [
      { src: "/images/projects/tactix/tactix-gallery-01.jpg", alt: "3D chess gameplay interface", caption: "Premium 3D rendering with realistic materials" },
      { src: "/images/projects/tactix/tactix-gallery-02.jpg", alt: "Social chess learning", caption: "Learning chess together" },
      { src: "/images/projects/tactix/tactix-gallery-03.jpg", alt: "iPad tablet experience", caption: "Beautiful cross-device experience" },
    ],
    metrics: [
      { label: "Lessons", value: "25+" },
      { label: "Puzzles", value: "100+" },
      { label: "AI Levels", value: "5" },
      { label: "Server Latency", value: "0ms" },
    ],
    testimonial: {
      quote: "TACTIX represents what chess software should have always been: a visually stunning, intellectually engaging experience that respects both the beauty of the game and the intelligence of the player.",
      author: "Tactix Team",
      role: "Product Vision",
      company: "TACTIX",
    },
    accentColor: "45 61% 52%",
  },
  {
    slug: "nuu",
    title: "NUU",
    description: "AI-powered property matching platform for the Australian rental market.",
    category: "SaaS",
    client: "NUU Systems",
    industry: "PropTech / Real Estate",
    timeline: "8 weeks",
    year: 2025,
    featured: true,
    services: ["Brand Strategy", "UI/UX Design", "Design System", "Frontend Development", "Backend Development", "AI/ML Integration", "Database Architecture"],
    techStack: ["React 19", "Vite", "TypeScript", "Three.js", "React Three Fiber", "OpenAI GPT-4o", "Supabase", "PostgreSQL", "pgvector", "PostGIS", "Vercel", "Tailwind CSS"],
    liveUrl: "",
    challenge: "The Australian rental market is notoriously competitive and frustrating. Renters struggle with fragmented listings across multiple platforms, impersonal search filters that don't capture lifestyle preferences, and an overwhelming number of unsuitable results. Traditional property search interfaces require users to think in technical terms rather than expressing what they actually want: 'a beachy vibe near good coffee shops' or 'somewhere quiet for my family near trains to the CBD'.",
    approach: "We took an AI-first design approach, reimagining property search as a conversation rather than a form. We implemented GPT-4o as a 'property concierge' that extracts structured preferences from natural language. We developed a sophisticated 7-factor weighted scoring algorithm that evaluates location, budget, features, amenities, transport, property type, and bedrooms. We created an industrial 'operating system' aesthetic that positions NUU as a premium, tech-forward solution.",
    solution: "NUU is a full-stack property matching platform featuring a conversational AI interface powered by GPT-4o that guides users through preference discovery in 2-3 natural exchanges. The multi-factor matching algorithm scores properties across 7 dimensions with bonuses for exceptional matches. The frontend features an immersive 3D architectural visualization built with Three.js, scroll-triggered animations, and a dark industrial design language. The backend runs on Vercel serverless with Supabase PostgreSQL, including pgvector for semantic search and PostGIS for geospatial queries.",
    outcome: "The platform transforms the rental search experience from a tedious filtering exercise into an engaging conversation. The AI accurately extracts preferences from casual language and the matching algorithm surfaces relevant properties. The industrial 'operating system' branding differentiates NUU in a market full of generic real estate interfaces. The architecture is built for scale with vector search ready for real-time property data feeds.",
    heroImage: "/images/projects/nuu/nuu-hero.jpg",
    thumbnail: "/images/projects/nuu/nuu-thumb.jpg",
    gallery: [
      { src: "/images/projects/nuu/nuu-gallery-01.jpg", alt: "AI concierge chat", caption: "GPT-4o powered conversational search" },
      { src: "/images/projects/nuu/nuu-gallery-02.jpg", alt: "Property results", caption: "Scored matches with AI explanations" },
      { src: "/images/projects/nuu/nuu-gallery-03.jpg", alt: "3D visualization", caption: "Three.js architectural scene" },
    ],
    metrics: [
      { label: "Conversations", value: "2-3" },
      { label: "Scoring Factors", value: "7" },
      { label: "Match Precision", value: "99%" },
      { label: "Response Time", value: "<2s" },
    ],
    testimonial: {
      quote: "NUU bypassed the traditional rental friction. My application was processed and approved in 48 hours. Efficiency at its finest.",
      author: "Batbold B.",
      role: "Engineer",
      company: "Sydney",
    },
    accentColor: "18 100% 50%",
  },
  {
    slug: "project-alpha",
    title: "Project Alpha",
    description: "Complete brand identity and web platform for a fintech startup revolutionizing payments.",
    category: "Brand",
    client: "Alpha Inc.",
    industry: "Fintech",
    timeline: "8 weeks",
    year: 2024,
    featured: false,
    services: ["Brand Strategy", "Visual Identity", "Web Design", "Development"],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Sanity CMS"],
    liveUrl: "https://example.com",
    challenge: "Alpha Inc. came to us as a pre-launch fintech startup with a revolutionary payment solution but no visual identity. They needed to establish credibility in a crowded market while communicating complex technology in an approachable way. The challenge was creating a brand that felt both innovative and trustworthy, edgy enough to stand out but professional enough for enterprise clients.",
    approach: "We started with extensive research into the fintech landscape, identifying visual patterns and finding white space. Rather than following typical fintech conventions (blues, gradients, abstract shapes), we developed a distinctive visual language rooted in precision and clarity. The brand system was built to scale, from business cards to complex data visualizations.",
    solution: "The final system includes a complete brand identity with logo, typography, color palette, and extensive guidelines. The web platform was built with Next.js for performance and features custom animations, a blog system, and integration with their product demo. Every component was designed as part of a cohesive system that can grow with the company.",
    outcome: "The new brand helped Alpha Inc. secure their Series A funding within three months of launch. The website consistently achieves 95+ Lighthouse scores and has become a key part of their sales process. The design system continues to serve them as they scale their team and product.",
    heroImage: "/images/projects/alpha-hero.jpg",
    thumbnail: "/images/projects/alpha-thumb.jpg",
    gallery: [
      { src: "/images/projects/alpha-1.jpg", alt: "Brand identity system", caption: "Complete brand identity system" },
      { src: "/images/projects/alpha-2.jpg", alt: "Website homepage", caption: "Responsive web platform" },
      { src: "/images/projects/alpha-3.jpg", alt: "Mobile experience", caption: "Mobile-first approach" },
    ],
    metrics: [
      { label: "Lighthouse Score", value: "95+" },
      { label: "Time to Series A", value: "3 months" },
      { label: "Page Load Time", value: "< 1.2s" },
    ],
    testimonial: {
      quote: "Craefto Lab didn&apos;t just design our brand. They helped us understand who we are. The system they created has become the foundation for everything we do.",
      author: "Sarah Chen",
      role: "CEO & Co-founder",
      company: "Alpha Inc.",
    },
    accentColor: "145 18% 36%",
  },
  {
    slug: "project-beta",
    title: "Project Beta",
    description: "SaaS platform redesign and development for a B2B analytics company.",
    category: "Web",
    client: "Beta Analytics",
    industry: "B2B SaaS",
    timeline: "12 weeks",
    year: 2024,
    featured: false,
    services: ["Product Design", "UX Research", "Frontend Development", "Design System"],
    techStack: ["React", "TypeScript", "Tailwind CSS", "Recharts", "PostgreSQL"],
    liveUrl: "https://example.com",
    challenge: "Beta Analytics had a powerful product with a dated interface. Users loved the capabilities but struggled with the complexity. The challenge was redesigning the entire platform while maintaining familiarity for existing users and improving the experience for new ones.",
    approach: "We conducted user research to understand workflows and pain points. The redesign focused on progressive disclosure, keeping advanced features accessible but not overwhelming. We worked in close collaboration with the engineering team to ensure every design decision was technically feasible and performant.",
    solution: "We delivered a comprehensive design system with 50+ components, detailed documentation, and implementation guidelines. The new interface features contextual help, keyboard shortcuts, and a customizable dashboard that adapts to different user roles.",
    outcome: "User satisfaction scores increased by 35% after the redesign. The new onboarding flow improved trial-to-paid conversion by 22%. The design system continues to accelerate their product development.",
    heroImage: "/images/projects/beta-hero.jpg",
    thumbnail: "/images/projects/beta-thumb.jpg",
    gallery: [
      { src: "/images/projects/beta-1.jpg", alt: "Dashboard redesign", caption: "New analytics dashboard" },
      { src: "/images/projects/beta-2.jpg", alt: "Component library", caption: "50+ component design system" },
    ],
    metrics: [
      { label: "User Satisfaction", value: "+35%" },
      { label: "Conversion Rate", value: "+22%" },
      { label: "Task Completion", value: "-40% time" },
      { label: "Components Built", value: "50+" },
    ],
    testimonial: {
      quote: "The redesign transformed how our users interact with data. What used to take 10 clicks now takes 2.",
      author: "Michael Torres",
      role: "VP of Product",
      company: "Beta Analytics",
    },
    accentColor: "220 70% 50%",
  },
  {
    slug: "project-gamma",
    title: "Project Gamma",
    description: "Interactive product experience with 3D visualization and real-time configuration.",
    category: "Creative",
    client: "Gamma Design Co.",
    industry: "E-commerce",
    timeline: "10 weeks",
    year: 2024,
    featured: false,
    services: ["Creative Technology", "3D Development", "WebGL", "UX Design"],
    techStack: ["Three.js", "React Three Fiber", "Next.js", "GSAP", "Blender"],
    liveUrl: "https://example.com",
    challenge: "Gamma needed a way to showcase their customizable products online with the same fidelity as seeing them in person. Standard product photography couldn't capture the range of options or the quality of materials.",
    approach: "We developed a WebGL-based 3D configurator that lets users explore products from every angle and customize materials, colors, and components in real-time. The technical challenge was maintaining visual quality while ensuring smooth performance across devices.",
    solution: "The configurator uses Three.js with custom shaders for realistic material rendering. The interface was designed for both desktop and touch devices. We implemented a smart loading system that prioritizes visible elements and progressively loads higher-quality assets.",
    outcome: "The configurator increased average session time by 3x and became a key differentiator in Gamma's sales process. Online orders with customizations increased by 60%.",
    heroImage: "/images/projects/gamma-hero.jpg",
    thumbnail: "/images/projects/gamma-thumb.jpg",
    gallery: [
      { src: "/images/projects/gamma-1.jpg", alt: "3D product view", caption: "Photorealistic 3D rendering" },
      { src: "/images/projects/gamma-2.jpg", alt: "Configurator UI", caption: "Intuitive configuration interface" },
    ],
    metrics: [
      { label: "Session Time", value: "3x increase" },
      { label: "Custom Orders", value: "+60%" },
      { label: "Mobile Performance", value: "60fps" },
    ],
    accentColor: "280 60% 50%",
  },
];

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  // Only cycle through featured (real) projects for "next project"
  const featuredProjects = projects.filter((p) => p.featured);
  const currentFeaturedIndex = featuredProjects.findIndex((p) => p.slug === slug);
  const nextProject = currentFeaturedIndex !== -1
    ? featuredProjects[(currentFeaturedIndex + 1) % featuredProjects.length]
    : featuredProjects[0];

  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-16">
          {/* Back Link */}
          <Section spacing="xs">
            <Container>
              <HeroText>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to work
                </Link>
              </HeroText>
            </Container>
          </Section>

          {/* Hero Header */}
          <Section spacing="sm">
            <Container>
              <div className="max-w-4xl">
                <HeroText>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge>{project.category}</Badge>
                    <span className="text-sm text-[hsl(var(--color-foreground-muted))]">{project.year}</span>
                  </div>
                </HeroText>
                <HeroText delay={0.05}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
                    {project.title}
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl sm:text-2xl text-[hsl(var(--color-foreground-muted))] leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </HeroText>
                {project.liveUrl && (
                  <HeroText delay={0.15}>
                    <div className="mt-8">
                      <Button size="lg" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <span className="btn-text-wrapper">
                            <span className="btn-text-primary">
                              Visit live site
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                            <span className="btn-text-secondary" aria-hidden="true">
                              View project
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          </span>
                        </a>
                      </Button>
                    </div>
                  </HeroText>
                )}
              </div>
            </Container>
          </Section>

          {/* Hero Image */}
          <Section spacing="sm">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden relative">
                  <ProjectImage
                    project={project}
                    src={project.heroImage}
                    alt={`${project.title} hero`}
                    caption="Main project showcase"
                    imageType="hero"
                  />
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Project Metadata */}
          <Section spacing="md">
            <Container>
              <AnimatedSection>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-6 sm:p-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-2">Client</p>
                    <p className="font-medium">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-2">Industry</p>
                    <p className="font-medium">{project.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-2">Timeline</p>
                    <p className="font-medium">{project.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-2">Year</p>
                    <p className="font-medium">{project.year}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-2">Services</p>
                    <p className="font-medium">{project.services.join(" · ")}</p>
                  </div>
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* The Challenge */}
          <Section spacing="md">
            <Container size="md">
              <AnimatedSection>
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-4">01 / The Challenge</p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                  Understanding the problem
                </h2>
                <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                  {project.challenge}
                </p>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Gallery Image */}
          <Section spacing="sm">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="aspect-[16/9] rounded-xl overflow-hidden relative">
                  <ProjectImage
                    project={project}
                    src={project.gallery[0]?.src}
                    alt={project.gallery[0]?.alt || "Project gallery"}
                    caption={project.gallery[0]?.caption || "Challenge context visualization"}
                    imageType="gallery"
                  />
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* The Approach */}
          <Section spacing="md">
            <Container size="md">
              <AnimatedSection>
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-4">02 / The Approach</p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                  How we tackled it
                </h2>
                <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                  {project.approach}
                </p>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Image Grid */}
          <Section spacing="sm">
            <Container>
              <AnimatedSection>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                    <ProjectImage
                      project={project}
                      src={project.gallery[1]?.src}
                      alt={project.gallery[1]?.alt || "Design process"}
                      caption={project.gallery[1]?.caption || "Design process & iterations"}
                      imageType="gallery"
                    />
                  </div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                    <ProjectImage
                      project={project}
                      src={project.gallery[2]?.src}
                      alt={project.gallery[2]?.alt || "Implementation"}
                      caption={project.gallery[2]?.caption || "Implementation details"}
                      imageType="gallery"
                    />
                  </div>
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* The Solution */}
          <Section spacing="md">
            <Container size="md">
              <AnimatedSection>
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-4">03 / The Solution</p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                  What we built
                </h2>
                <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                  {project.solution}
                </p>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Tech Stack */}
          <Section spacing="sm">
            <Container>
              <AnimatedSection>
                <div className="p-6 sm:p-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                  <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-4">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-sm font-medium rounded-full bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Full Width Image */}
          <Section spacing="sm">
            <Container>
              <AnimatedSection variant="scaleIn">
                <div className="aspect-[21/9] rounded-xl overflow-hidden relative">
                  <ProjectImage
                    project={project}
                    src={project.heroImage}
                    alt={`${project.title} showcase`}
                    caption="Full showcase view"
                    imageType="hero"
                  />
                </div>
              </AnimatedSection>
            </Container>
          </Section>

          {/* The Outcome */}
          <Section spacing="md">
            <Container size="md">
              <AnimatedSection>
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--color-foreground-subtle))] mb-4">04 / The Outcome</p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                  Results & impact
                </h2>
                <p className="text-lg text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                  {project.outcome}
                </p>
              </AnimatedSection>
            </Container>
          </Section>

          {/* Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <Section spacing="sm">
              <Container>
                <AnimatedSection>
                  <StaggeredGrid className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {project.metrics.map((metric, index) => (
                      <StaggeredItem key={metric.label}>
                        <div className="p-6 sm:p-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-center">
                          <p className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                            {metric.value}
                          </p>
                          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                            {metric.label}
                          </p>
                        </div>
                      </StaggeredItem>
                    ))}
                  </StaggeredGrid>
                </AnimatedSection>
              </Container>
            </Section>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <Section spacing="md">
              <Container size="md">
                <AnimatedSection variant="scaleIn">
                  <div className="p-8 sm:p-12 rounded-2xl bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))]">
                    <svg className="w-10 h-10 mb-6 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-8">
                      {project.testimonial.quote}
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-background))]/20 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {project.testimonial.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{project.testimonial.author}</p>
                        <p className="text-sm opacity-70">
                          {project.testimonial.role}, {project.testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </Container>
            </Section>
          )}

          {/* Awards */}
          {project.awards && project.awards.length > 0 && (
            <Section spacing="sm">
              <Container>
                <AnimatedSection>
                  <div className="flex flex-wrap justify-center gap-4">
                    {project.awards.map((award) => (
                      <div
                        key={award}
                        className="px-4 py-2 rounded-full border border-[hsl(var(--color-border))] text-sm font-medium text-[hsl(var(--color-foreground-muted))]"
                      >
                        {award}
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </Container>
            </Section>
          )}

          {/* Live Site CTA */}
          {project.liveUrl && (
            <Section spacing="md">
              <Container>
                <AnimatedSection>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <span className="btn-text-wrapper">
                          <span className="btn-text-primary">
                            Visit live site
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                          <span className="btn-text-secondary" aria-hidden="true">
                            View project
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </span>
                      </a>
                    </Button>
                  </div>
                </AnimatedSection>
              </Container>
            </Section>
          )}

          {/* Next Project */}
          <Section spacing="lg">
            <Container>
              <Separator className="mb-16" />
              <AnimatedSection>
                <Link href={`/work/${nextProject.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* Background Image */}
                    <div className="aspect-[21/9] sm:aspect-[3/1]">
                      <ProjectImagePlaceholder
                        projectName={nextProject.title}
                        imageType="hero"
                        caption=""
                        accentColor={nextProject.accentColor}
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity group-hover:from-black/70" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
                        Next Case Study
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                              {nextProject.category}
                            </Badge>
                          </div>
                          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-2 relative inline-block" style={{ color: '#ffffff' }}>
                            {nextProject.title}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                          </p>
                          <p className="text-sm sm:text-base text-white/70 max-w-xl line-clamp-2">
                            {nextProject.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-white shrink-0">
                          <span className="text-sm font-medium hidden sm:inline">View project</span>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-white/20">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            </Container>
          </Section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
