import type { Metadata } from "next";
import { AuthProvider } from "@/lib/portal/auth-context";

export const metadata: Metadata = {
  title: "Portal | Craefto Lab",
  description: "Stakeholder updates portal for Craefto Lab projects.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[hsl(var(--color-background))]">
        {children}
      </div>
    </AuthProvider>
  );
}
