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
   icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
   }
  };
 } catch (error) {
  console.error("Metadata generation error:", error);
  return {
   title: "CRM",
   description: "CRM система для типографий и производителей одежды",
  };
 }
}
import { headers } from "next/headers";
import { Providers } from "./providers";

export default async function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const branding = await getBrandingSettings();
 const headersList = await headers();
 const nonce = headersList.get("x-nonce") || "";

 return (
  <html lang="ru" className={`${manrope.variable}`} suppressHydrationWarning nonce={nonce}>
   <body className="antialiased font-sans">
    <Providers branding={branding}>
     {children}
    </Providers>
    <ToastContainer />
   </body>
  </html>
 );
}
