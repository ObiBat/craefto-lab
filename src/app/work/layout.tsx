import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A selection of projects across brand, web, and product. See how we build systems for founders and teams.",
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
