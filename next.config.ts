import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images from external sources
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
