import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Experiments, tools, and R&D from Craefto Lab. Coming soon.",
};

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
