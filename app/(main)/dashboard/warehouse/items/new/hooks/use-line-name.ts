"use client";

import { useState, useCallback, useMemo } from "react";
import { generateLineName } from "@/lib/utils/line-name-generator";

interface AttributeValue {
    attributeId: string;
    attributeCode?: string;
    attributeName: string;
    value: string;
    valueLabel?: string;
}

interface UseLineNameOptions {
    /** Выбранные общие атрибуты */
    commonAttributes: AttributeValue[];
    /** Начальное пользовательское название */
    initialCustomName?: string;
}

interface UseLineNameReturn {
    /** Текущее название (пользовательское или сгенерированное) */
    displayName: string;
    /** Пользовательское название (может быть пустым) */
    customName: string;
    /** Автоматически сгенерированное название */
    generatedName: string;
    /** Использует ли пользовательское название */
    isCustom: boolean;
    /** Установить пользовательское название */
    setCustomName: (name: string) => void;
    /** Сбросить к автоматическому названию */
    resetToGenerated: () => void;
}

export function useLineName(options: UseLineNameOptions): UseLineNameReturn {
    const { commonAttributes, initialCustomName = "" } = options;

    const [customName, setCustomName] = useState(initialCustomName);

    // Генерируем название из атрибутов
    const generatedName = useMemo(() => {
        return generateLineName({ attributes: commonAttributes });
    }, [commonAttributes]);

    // Определяем, используется ли пользовательское название
    const isCustom = customName.trim().length > 0;

    // Текущее отображаемое название
    const displayName = isCustom ? customName : generatedName;

    // Сброс к автоматическому названию
    const resetToGenerated = useCallback(() => {
        setCustomName("");
    }, []);

    return {
        displayName,
        customName,
        generatedName,
        isCustom,
        setCustomName,
        resetToGenerated,
    };
}
