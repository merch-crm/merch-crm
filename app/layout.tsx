import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

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
    <html lang="ru">
      <body className={`${manrope.variable} antialiased font-manrope`}>
        <BrandingProvider>
          {children}
        </BrandingProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
