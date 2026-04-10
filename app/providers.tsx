"use client";

import { BrandingProvider } from "@/components/branding-provider";
import { SheetStackProvider } from "@/components/ui/sheet-stack-context";
import { TypographyProvider } from "@/components/typography-provider";
import { CsrfProvider } from "@/components/csrf-provider";
import { Toaster } from "sonner";

import type { BrandingSettings } from "@/lib/types";

export function Providers({ 
 children, 
 branding 
}: { 
 children: React.ReactNode; 
 branding: BrandingSettings | null;
}) {
 return (
  <>
   <Toaster />
   <CsrfProvider>
    <BrandingProvider initialData={branding}>
     <SheetStackProvider>
      <TypographyProvider>
       {children}
      </TypographyProvider>
     </SheetStackProvider>
    </BrandingProvider>
   </CsrfProvider>
  </>
 );
}
