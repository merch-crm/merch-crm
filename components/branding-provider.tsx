"use client";

import React, { useEffect, useState } from "react";
import { getBrandingAction } from "@/app/dashboard/admin/actions";

export interface BrandingSettings {
    primary_color?: string;
    system_name?: string;
    system_logo?: string;
    radius_outer?: number;
    radius_inner?: number;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings | null>(null);

    useEffect(() => {
        async function loadBranding() {
            const result = await getBrandingAction();
            if (result.data) {
                setBranding(result.data);
            }
        }
        loadBranding();
    }, []);

    if (!branding) return <>{children}</>;

    const primaryColor = branding.primary_color || "#6366f1";
    const radiusOuter = branding.radius_outer || 24;
    const radiusInner = branding.radius_inner || 14;

    return (
        <>
            <style jsx global>{`
        :root {
          --primary: ${primaryColor};
          --crm-brand-main: ${primaryColor};
          --ring: ${primaryColor}40;
          --radius-outer: ${radiusOuter}px;
          --radius-inner: ${radiusInner}px;
          --radius: ${radiusInner}px;
        }
      `}</style>
            {children}
        </>
    );
}
