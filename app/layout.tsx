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

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  const favicon = (branding as { faviconUrl?: string })?.faviconUrl || "/icon.png";

  return {
    title: (branding as { companyName?: string })?.companyName || "MerchCRM",
    description: "CRM система для типографий и производителей одежды",
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: [
        { url: favicon },
        { url: "/icon.png" },
        { url: "/favicon.ico" }
      ],
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
