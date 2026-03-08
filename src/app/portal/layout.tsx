import type { Metadata } from "next";
import { AuthProvider } from "@/lib/portal/auth-context";
import { ToastProvider } from "@/components/portal/toast";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Portal | Cræfto",
  description: "Stakeholder updates portal for Cræfto projects.",
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
      <ToastProvider>
        <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
