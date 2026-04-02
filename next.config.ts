import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "sharp"],
  transpilePackages: ["jspdf", "jspdf-autotable", "three", "@react-three/drei", "@react-three/fiber", "troika-three-text"],
  devIndicators: {
    position: "top-right",
  },
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
      { protocol: 'https', hostname: 's3.regru.cloud' },
      { protocol: 'https', hostname: '*.s3.regru.cloud' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'www.transparenttextures.com' },
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

    // Suppress warnings from libheif-js (common with WASM modules in Next.js)
    config.ignoreWarnings = [
      { module: /node_modules\/libheif-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ }
    ];

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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Content-Security-Policy is set dynamically in middleware.ts with nonces
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
