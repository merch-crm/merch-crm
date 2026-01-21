import type { Metadata } from "next";
import { geistSans, geistMono } from "@/app/fonts";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

import { getBrandingSettings } from "@/app/dashboard/admin/branding/actions";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  return {
    title: (branding as { companyName?: string })?.companyName || "MerchCRM",
    description: "CRM система для типографии",
    icons: {
      icon: (branding as { faviconUrl?: string })?.faviconUrl || "/icon.png",
    },
  };
}

import { BrandingProvider } from "@/components/branding-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased font-sans">
        <BrandingProvider>
          {children}
        </BrandingProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
