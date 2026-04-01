import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { roles, getRoleBySlug, getAllRoleSlugs } from "@/lib/careers";
import { RolePageClient } from "./client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllRoleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    return {
      title: "Role Not Found | Careers | Craefto",
    };
  }

  return {
    title: `${role.title} | Careers`,
    description: role.description,
    openGraph: {
      title: `${role.title} | Careers | Craefto`,
      description: role.description,
      type: "website",
      url: `https://www.craefto.com/careers/${role.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${role.title} | Careers | Craefto`,
      description: role.description,
    },
    alternates: {
      canonical: `https://www.craefto.com/careers/${role.slug}`,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RolePage({ params }: PageProps) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    notFound();
  }

  const applySubject = encodeURIComponent(`Application: ${role.title}`);
  const applyBody = encodeURIComponent(
    `Hi Craefto,\n\nI am interested in the ${role.title} position.\n\n[Please attach your portfolio/resume and tell us a bit about yourself]\n\nBest regards`
  );
  const applyHref = `mailto:hello@craefto.com?subject=${applySubject}&body=${applyBody}`;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: role.description,
    datePosted: role.postedDate,
    employmentType: role.type.includes("Contract")
      ? "CONTRACTOR"
      : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Craefto",
      sameAs: "https://www.craefto.com",
      logo: "https://www.craefto.com/logo.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: role.location === "Remote" ? "Sydney" : role.location,
        addressCountry: "AU",
      },
    },
    jobLocationType: role.location === "Remote" ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: role.location === "Remote"
      ? {
          "@type": "Country",
          name: "Australia",
        }
      : undefined,
    industry: "Technology",
    occupationalCategory: role.department,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <RolePageClient role={role} applyHref={applyHref} />
      <Footer />
    </>
  );
}
