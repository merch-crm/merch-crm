import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  transpilePackages: ["jspdf", "jspdf-autotable"],
  devIndicators: {
    position: "top-right",
  },
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "@phosphor-icons/react",
      "@tabler/icons-react",
      "react-icons",
      "date-fns",
      "recharts",
      "framer-motion",
      "@radix-ui/react-icons",
    ],
  },
  images: {
    localPatterns: [
      { pathname: "/api/storage/local/**" },
      { pathname: "/api/files/calculators/designs/**" },
      { pathname: "/*.png" },
      { pathname: "/*.svg" },
      { pathname: "/*.jpg" },
      { pathname: "/*.jpeg" },
      { pathname: "/*.ico" },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    formats: ['image/webp'],
    minimumCacheTTL: process.env.NODE_ENV === 'production' ? 31536000 : 60,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "eval";
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard/warehouse',
        destination: '/dashboard/warehouse/overview',
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
