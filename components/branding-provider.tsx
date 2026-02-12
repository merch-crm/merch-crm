"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initSoundSettings, setGlobalSoundConfig } from "@/lib/sounds";
import { BrandingSettings, getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

const BrandingContext = createContext<BrandingSettings>({
    companyName: "MerchCRM",
    logoUrl: null,
    primaryColor: "#5d00ff",
    faviconUrl: null,
    radiusOuter: 24,
    radiusInner: 14,
    currencySymbol: "₽",
    dateFormat: "DD.MM.YYYY",
    timezone: "Europe/Moscow"
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings | null>(null);

    useEffect(() => {
        async function loadBranding() {
            const data = await getBrandingSettings();
            if (data) {
                setBranding(data);

                // Initialize sounds
                initSoundSettings();
                if (data.soundConfig) {
                    setGlobalSoundConfig(data.soundConfig);
                }
            }
        }
        loadBranding();
    }, []);

    const values = branding || {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        faviconUrl: null,
        radiusOuter: 24,
        radiusInner: 14,
        currencySymbol: "₽",
        dateFormat: "DD.MM.YYYY",
        timezone: "Europe/Moscow"
    };

    const primaryColor = values.primaryColor || "#5d00ff";
    const radiusOuter = values.radiusOuter || 24;
    const radiusInner = values.radiusInner || 14;

    return (
        <BrandingContext.Provider value={values}>
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
        </BrandingContext.Provider>
    );
}
