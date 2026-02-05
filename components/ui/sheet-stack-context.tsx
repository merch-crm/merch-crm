"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface SheetStackContextType {
    registerSheet: (id: string) => number;
    unregisterSheet: (id: string) => void;
    getStackDepth: (id: string) => number;
    stack: string[];
}

const SheetStackContext = createContext<SheetStackContextType | null>(null);

export function SheetStackProvider({ children }: { children: React.ReactNode }) {
    const [stack, setStack] = useState<string[]>([]);

    const registerSheet = useCallback((id: string) => {
        setStack(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
        return stack.length;
    }, [stack.length]);

    const unregisterSheet = useCallback((id: string) => {
        setStack(prev => prev.filter(item => item !== id));
    }, []);

    const getStackDepth = useCallback((id: string) => {
        return stack.indexOf(id);
    }, [stack]);

    const value = useMemo(() => ({
        registerSheet,
        unregisterSheet,
        getStackDepth,
        stack
    }), [registerSheet, unregisterSheet, getStackDepth, stack]);

    return (
        <SheetStackContext.Provider value={value}>
            {children}
        </SheetStackContext.Provider>
    );
}

export function useSheetStack() {
    const context = useContext(SheetStackContext);
    if (!context) {
        throw new Error("useSheetStack must be used within a SheetStackProvider");
    }
    return context;
}
