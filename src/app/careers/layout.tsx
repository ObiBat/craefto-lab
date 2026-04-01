import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Craefto. We are a creative tech studio looking for talented designers, engineers, and builders who care about craft. Remote first, meaningful projects, real ownership.",
  openGraph: {
    title: "Careers | Craefto",
    description:
      "Join Craefto. We are looking for talented people who care about craft. Remote first, meaningful projects, real ownership.",
    type: "website",
    url: "https://www.craefto.com/careers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | Craefto",
    description:
      "Join Craefto. Remote first, meaningful projects, real ownership.",
  },
  alternates: {
    canonical: "https://www.craefto.com/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
