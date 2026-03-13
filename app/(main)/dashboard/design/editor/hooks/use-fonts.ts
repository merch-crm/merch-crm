"use client";

import { useState, useEffect } from "react";
import { getSystemFonts } from "../actions/font-actions";

interface FontInfo {
    id: string;
    name: string;
    family: string;
    category: string;
    isLoaded: boolean;
}

export function useFonts() {
    const [fonts, setFonts] = useState<FontInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadFonts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadFonts = async () => {
        setIsLoading(true);

        const result = await getSystemFonts();

        if (result.success && result.data) {
            const fontList = (result.data || []).map((font) => ({
                id: font.id,
                name: font.name,
                family: font.family,
                category: font.category || "sans-serif",
                isLoaded: false,
            }));

            setFonts(fontList);

            // Загружаем кастомные шрифты (с путями к файлам)
            for (const font of result.data) {
                if (font.regularPath) {
                    await loadFontFace(font.family, font.regularPath, "normal", "normal");
                }
                if (font.boldPath) {
                    await loadFontFace(font.family, font.boldPath, "bold", "normal");
                }
                if (font.italicPath) {
                    await loadFontFace(font.family, font.italicPath, "normal", "italic");
                }
                if (font.boldItalicPath) {
                    await loadFontFace(font.family, font.boldItalicPath, "bold", "italic");
                }
            }

            // Помечаем все как загруженные
            setFonts((prev) =>
                prev.map((f) => ({ ...f, isLoaded: true }))
            );
            setLoadedFonts(new Set(fontList.map((f) => f.family)));
        }

        setIsLoading(false);
    };

    const loadFontFace = async (
        family: string,
        url: string,
        weight: string,
        style: string
    ) => {
        try {
            const font = new FontFace(family, `url(${url})`, {
                weight,
                style,
            });

            await font.load();
            document.fonts.add(font);

            return true;
        } catch (error) {
            console.error(`Failed to load font ${family}:`, error);
            return false;
        }
    };

    const isFontLoaded = (family: string) => loadedFonts.has(family);

    // Группировка по категориям
    const fontsByCategory = fonts.reduce((acc, font) => {
        const category = font.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(font);
        return acc;
    }, {} as Record<string, FontInfo[]>);

    return {
        fonts,
        fontsByCategory,
        isLoading,
        isFontLoaded,
        loadFontFace,
    };
}
