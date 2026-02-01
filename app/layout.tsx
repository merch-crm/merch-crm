import type { Metadata } from "next";
import { manrope } from "@/app/fonts";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  return {
    title: (branding as { companyName?: string })?.companyName || "MerchCRM",
    description: "CRM система для типографии",
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    ...(branding && (branding as { faviconUrl?: string }).faviconUrl
      ? {
        icons: {
          icon: (branding as { faviconUrl?: string }).faviconUrl,
        },
      }
      : {}),
    viewport: "width=device-width, initial-scale=1, maximum-scale=1", // Prevent zoom on mobile inputs
  };
}

import { BrandingProvider } from "@/components/branding-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <BrandingProvider>
          {children}
        </BrandingProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
