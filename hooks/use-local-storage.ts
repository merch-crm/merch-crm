"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Сохраняет и синхронизирует значение с localStorage.
 * Типобезопасный аналог useState, но с персистентностью.
 *
 * @example
 * const [filters, setFilters] = useLocalStorage("orders-filters", { status: "all" });
 * const [columns, setColumns] = useLocalStorage("table-columns", ["name", "date"]);
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // Lazy initialization — read from localStorage only once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            console.warn(`[useLocalStorage] Ошибка чтения ключа "${key}"`);
            return initialValue;
        }
    });

    // Write to localStorage whenever value changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch {
            console.warn(`[useLocalStorage] Ошибка записи ключа "${key}"`);
        }
    }, [key, storedValue]);

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue(prev => {
                const nextValue = value instanceof Function ? value(prev) : value;
                return nextValue;
            });
        },
        []
    );

    const removeValue = useCallback(() => {
        setStoredValue(initialValue);
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [storedValue, setValue, removeValue];
}
