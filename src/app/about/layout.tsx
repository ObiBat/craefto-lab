import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Craefto is a creative-tech studio building systems for founders and teams who think long-term.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
