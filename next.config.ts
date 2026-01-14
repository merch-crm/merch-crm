import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // We want the build to fail if there are type errors to ensure stability
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
