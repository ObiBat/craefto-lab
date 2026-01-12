import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { CookieConsent, BackToTop } from "@/components/ui";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://craefto.com"),
  title: {
    default: "Craefto Lab | Creative Tech Studio",
    template: "%s | Craefto Lab",
  },
  description:
    "Craefto Lab is a creative tech studio. We design and build brands, products, and tools for founders and teams who value craft.",
  keywords: [
    "design studio",
    "web development",
    "brand identity",
    "SaaS development",
    "creative technology",
    "design systems",
    "Next.js development",
    "React development",
    "startup studio",
    "UI/UX design",
    "product design",
    "web design agency",
  ],
  authors: [{ name: "Craefto Lab", url: "https://craefto.com" }],
  creator: "Craefto Lab",
  publisher: "Craefto Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://craefto.com",
    siteName: "Craefto Lab",
    title: "Craefto Lab | Creative Tech Studio",
    description:
      "We design and build brands, products, and tools for founders and teams who value craft.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Craefto Lab Creative Tech Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Craefto Lab | Creative Tech Studio",
    description:
      "We design and build brands, products, and tools for founders and teams who value craft.",
    creator: "@craeftolab",
    site: "@craeftolab",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://craefto.com",
  },
  category: "technology",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Craefto Lab",
  description:
    "Craefto Lab is a creative tech studio. We design and build brands, products, and tools for founders and teams who value craft.",
  url: "https://craefto.com",
  logo: "https://craefto.com/logo.png",
  sameAs: [
    "https://twitter.com/craeftolab",
    "https://linkedin.com/company/craeftolab",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@craefto.com",
    contactType: "customer service",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
  foundingDate: "2024",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 1,
    maxValue: 10,
  },
  knowsAbout: [
    "Web Development",
    "Brand Identity",
    "UI/UX Design",
    "SaaS Development",
    "Design Systems",
    "Creative Technology",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Brand Identity & Design Systems",
        description: "Strategic foundations and visual systems that scale with your business.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Web Design & Development",
        description: "Marketing sites, SaaS platforms, and dashboards built for performance.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "SaaS & Internal Tools",
        description: "MVPs, client portals, and automation systems.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <head>
        {/* Favicon Set */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[hsl(var(--color-primary))] focus:text-[hsl(var(--color-primary-foreground))] focus:top-0 focus:left-0"
        >
          Skip to main content
        </a>
        {children}
        <BackToTop />
        <CookieConsent />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
