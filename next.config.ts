import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["jspdf", "jspdf-autotable"],

  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    // We want the build to fail if there are type errors to ensure stability
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb", // Increase limit for large print file uploads
    },
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/storage/local/**",
      },
    ],
    // Разрешаем оптимизацию локальных загруженных файлов
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],

    // Размеры для responsive изображений
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Размеры для превью и иконок
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],

    // Форматы (WebP — лучшее сжатие)
    formats: ['image/webp'],

    // Кеширование: 1 год для prod, 1 минута для dev
    minimumCacheTTL: process.env.NODE_ENV === 'production' ? 31536000 : 60,
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
        source: '/api/design-variants/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
