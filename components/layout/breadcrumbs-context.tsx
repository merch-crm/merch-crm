"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsContextType {
    labels: Map<string, string>;
    setBreadcrumb: (path: string, label: string) => void;
    clearBreadcrumb: (path: string) => void;
    customTrail: BreadcrumbItem[] | null;
    setCustomTrail: (trail: BreadcrumbItem[] | null) => void;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType | undefined>(undefined);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
    const [labels, setLabels] = useState<Map<string, string>>(new Map());
    const [customTrail, setCustomTrail] = useState<BreadcrumbItem[] | null>(null);

    const setBreadcrumb = useCallback((path: string, label: string) => {
        setLabels(prev => {
            const newMap = new Map(prev);
            newMap.set(path, label);
            return newMap;
        });
    }, []);

    const clearBreadcrumb = useCallback((path: string) => {
        setLabels(prev => {
            const newMap = new Map(prev);
            newMap.delete(path);
            return newMap;
        });
    }, []);

    return (
        <BreadcrumbsContext.Provider value={{
            labels,
            setBreadcrumb,
            clearBreadcrumb,
            customTrail,
            setCustomTrail
        }}>
            {children}
        </BreadcrumbsContext.Provider>
    );
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbsContext);
    if (!context) {
        throw new Error("useBreadcrumbs must be used within BreadcrumbsProvider");
    }
    return context;
}
