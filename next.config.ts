import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on local network to access dev server
  allowedDevOrigins: ["http://192.168.1.100:3000"],
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
