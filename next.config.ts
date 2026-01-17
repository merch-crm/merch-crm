import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // We want the build to fail if there are type errors to ensure stability
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Increase limit for image uploads
    },
  },
};

export default nextConfig;
