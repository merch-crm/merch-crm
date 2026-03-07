"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsContextType {
    labels: Map<string, string>;
    customTrail: BreadcrumbItem[] | null;
    setLabels: (labels: Map<string, string>) => void;
    setCustomTrail: (trail: BreadcrumbItem[] | null) => void;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType | undefined>(undefined);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
    const [labels, setLabels] = useState<Map<string, string>>(new Map());
    const [customTrail, setCustomTrail] = useState<BreadcrumbItem[] | null>(null);

    const value = useMemo(() => ({
        labels,
        customTrail,
        setLabels,
        setCustomTrail
    }), [labels, customTrail]);

    return (
        <BreadcrumbsContext.Provider value={value}>
            {children}
        </BreadcrumbsContext.Provider>
    );
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbsContext);
    if (!context) {
        throw new Error("This hook must be used within BreadcrumbsProvider");
    }
    return context;
}
