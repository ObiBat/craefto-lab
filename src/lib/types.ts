export type CaseStudyCategory = "Brand" | "Web" | "Product" | "SaaS" | "AI";

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  category: CaseStudyCategory;
  client?: string;
  timeline?: string;
  services: string[];
  liveUrl?: string;
  heroImage: string;
  images: string[];
  challenge: string;
  approach: string;
  system: string;
  outcome: string;
  featured?: boolean;
}

export interface NavItem {
  name: string;
  href: string;
}

export interface Service {
  title: string;
  description: string;
  href: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface PositioningPoint {
  number: string;
  title: string;
  description: string;
}
