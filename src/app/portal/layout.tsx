import type { Metadata } from "next";
import { AuthProvider } from "@/lib/portal/auth-context";
import { ToastProvider } from "@/components/portal/toast";
import { RoleSwitcher } from "@/components/portal/role-switcher";

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
        <div className="min-h-screen bg-[hsl(var(--color-background))]">
          {children}
          <RoleSwitcher />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
