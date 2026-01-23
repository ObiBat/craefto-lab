import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on local network to access dev server
  allowedDevOrigins: ["http://192.168.1.100:3000"],
  // Required for @sparticuz/chromium to resolve its binary correctly on Vercel
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
