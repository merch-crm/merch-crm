import type { Metadata, Viewport } from "next";
import { manrope } from "@/app/fonts";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

import { getBrandingSettings } from "@/lib/branding";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const branding = await getBrandingSettings();
    const faviconUrl = (branding as { faviconUrl?: string })?.faviconUrl;

    return {
      title: {
        template: "%s",
        default: (branding as { companyName?: string })?.companyName || "CRM",
      },
      description: "CRM система для типографий и производителей одежды",
      robots: {
        index: false,
        follow: false,
      },
      // Next.js automatically detects favicon.ico and icon.png in the app directory.
      // We only provide icons if there's a custom dynamic override.
      ...(faviconUrl ? {
        icons: {
          icon: faviconUrl,
        }
      } : {
        icons: {
          icon: '/favicon.ico',
          apple: '/apple-icon.png',
        }
      }),
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "CRM",
      description: "CRM система для типографий и производителей одежды",
    };
  }
}

import { BrandingProvider } from "@/components/branding-provider";
import { SheetStackProvider } from "@/components/ui/sheet-stack-context";
import { TypographyProvider } from "@/components/typography-provider";
import { CsrfProvider } from "@/components/csrf-provider";

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingSettings();
  const nonce = (await headers()).get("x-nonce") || "";

  return (
    <html lang="ru" className={`${manrope.variable}`} suppressHydrationWarning nonce={nonce}>
      <body className="antialiased font-sans">

        <CsrfProvider>
          <BrandingProvider initialData={branding}>
            <SheetStackProvider>
              <TypographyProvider>
                {children}
              </TypographyProvider>
            </SheetStackProvider>
          </BrandingProvider>
        </CsrfProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
