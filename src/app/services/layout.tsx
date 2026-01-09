import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "We build tailored systems including brand identity, web development, SaaS products, and AI powered tools for founders and teams who value craft.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
