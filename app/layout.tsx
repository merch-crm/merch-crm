import type { Metadata, Viewport } from "next";
import { manrope } from "@/app/fonts";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  return {
    title: (branding as { companyName?: string })?.companyName || "MerchCRM",
    description: "CRM система для типографии",
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: branding?.faviconUrl || "/icon.png",
      apple: "/apple-icon.png",
    },
  };
}

import { BrandingProvider } from "@/components/branding-provider";
import { SheetStackProvider } from "@/components/ui/sheet-stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <BrandingProvider>
          <SheetStackProvider>
            {children}
          </SheetStackProvider>
        </BrandingProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
