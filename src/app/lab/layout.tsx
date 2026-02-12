import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Experiments, tools, and R&D from Craefto. Where we push boundaries and build what's next.",
};

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
