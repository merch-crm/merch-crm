"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getBrandingAction } from "@/app/(main)/admin-panel/actions";
import { initSoundSettings, setGlobalSoundConfig } from "@/lib/sounds";
import { SoundConfig } from "@/lib/sounds";

export interface BrandingSettings {
    primary_color?: string;
    system_name?: string;
    system_logo?: string | null;
    radius_outer?: number;
    radius_inner?: number;
    currencySymbol?: string;
    dateFormat?: string;
    timezone?: string;
    printLogoUrl?: string | null;
    soundConfig?: Record<string, SoundConfig>;
    [key: string]: unknown;
}

const BrandingContext = createContext<BrandingSettings>({
    primary_color: "#5d00ff",
    radius_outer: 24,
    radius_inner: 14,
    currencySymbol: "₽",
    dateFormat: "DD.MM.YYYY",
    timezone: "Europe/Moscow"
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings | null>(null);

    useEffect(() => {
        async function loadBranding() {
            const result = await getBrandingAction();
            if (result.data) {
                const data = result.data as BrandingSettings;
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
        primary_color: "#5d00ff",
        radius_outer: 24,
        radius_inner: 14,
        currencySymbol: "₽",
        dateFormat: "DD.MM.YYYY",
        timezone: "Europe/Moscow"
    };

    const primaryColor = values.primary_color || "#5d00ff";
    const radiusOuter = values.radius_outer || 24;
    const radiusInner = values.radius_inner || 14;

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
