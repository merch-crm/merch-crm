"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initSoundSettings, setGlobalSoundConfig } from "@/lib/sounds";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";
import type { BrandingSettings } from "@/lib/types";

const BrandingContext = createContext<BrandingSettings>({
    companyName: "MerchCRM",
    logoUrl: null,
    primaryColor: "#5d00ff",
    color: "#5d00ff",
    radiusOuter: 24,
    radiusInner: 14,
    currencySymbol: "₽",
    dateFormat: "DD.MM.YYYY",
    timezone: "Europe/Moscow"
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children, initialData }: { children: React.ReactNode; initialData?: BrandingSettings | null }) {
    const [branding, setBranding] = useState<BrandingSettings | null>(initialData || null);

    useEffect(() => {
        // Skip background fetching in tests or if initial data is fully provided
        const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
        if (isTest && initialData) {
            initSoundSettings();
            if (initialData.soundConfig) {
                setGlobalSoundConfig(initialData.soundConfig);
            }
            return;
        }

        async function loadBranding() {
            // Only fetch if not already provided
            if (!initialData && !branding) {
                const data = await getBrandingSettings();
                if (data) {
                    setBranding(data);
                }
            }

            // Initialize sounds
            initSoundSettings();
            const currentBranding = branding || initialData;
            if (currentBranding?.soundConfig) {
                setGlobalSoundConfig(currentBranding.soundConfig);
            }
        }
        loadBranding();
    }, [initialData, branding, setBranding]);

    const values = (branding || initialData || {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        color: "#5d00ff",
        radiusOuter: 24,
        radiusInner: 14,
        currencySymbol: "₽",
        dateFormat: "DD.MM.YYYY",
        timezone: "Europe/Moscow"
    }) as BrandingSettings;

    // Гарантируем наличие color, если он отсутствует в объекте из БД
    if (values && !values.color && values.primaryColor) {
        values.color = values.primaryColor;
    }

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
