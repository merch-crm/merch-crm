"use client";

import { useState, useEffect } from "react";

/**
 * Задерживает обновление значения на указанное время.
 * Используется для поиска — чтобы не отправлять запрос на каждое нажатие.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery) fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
