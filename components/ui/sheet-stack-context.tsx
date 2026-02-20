"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SheetStackContextType {
    stack: string[];
    pushSheet: (id: string) => void;
    popSheet: () => void;
    clearSheets: () => void;
    registerSheet: (id: string) => void;
    unregisterSheet: (id: string) => void;
    getStackDepth: (id: string) => number;
}

const SheetStackContext = createContext<SheetStackContextType | undefined>(undefined);

export function SheetStackProvider({ children }: { children: ReactNode }) {
    const [stack, setStack] = useState<string[]>([]);

    const pushSheet = useCallback((id: string) => {
        setStack((prev) => [...prev, id]);
    }, []);

    const popSheet = useCallback(() => {
        setStack((prev) => prev.slice(0, -1));
    }, []);

    const clearSheets = useCallback(() => {
        setStack([]);
    }, []);

    const registerSheet = useCallback((id: string) => {
        setStack((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    }, []);

    const unregisterSheet = useCallback((id: string) => {
        setStack((prev) => prev.filter(item => item !== id));
    }, []);

    const getStackDepth = useCallback((id: string) => {
        return stack.indexOf(id);
    }, [stack]);

    return (
        <SheetStackContext.Provider value={{
            stack,
            pushSheet,
            popSheet,
            clearSheets,
            registerSheet,
            unregisterSheet,
            getStackDepth
        }}>
            {children}
        </SheetStackContext.Provider>
    );
}

export function useSheetStack() {
    const context = useContext(SheetStackContext);
    if (!context) {
        throw new Error("This hook must be used within SheetStackProvider");
    }
    return context;
}
