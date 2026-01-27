"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { CLOTHING_QUALITIES } from "./category-utils";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";

interface QualityDropdownProps {
    value: string;
    onChange: (name: string, code: string) => void;
    className?: string; // Для внешней стилизации
    compact?: boolean;  // Режим компактного отображения для карточек
}

export function QualityDropdown({ value, onChange, className, compact = false }: QualityDropdownProps) {
    const options = useMemo(() => {
        return CLOTHING_QUALITIES.map(q => ({
            id: q.code,
            title: q.name,
            description: q.code === "PRM" ? "Премиум материалы" : "Базовые материалы",
            icon: <Sparkles className="w-4 h-4 opacity-50" />
        } as PremiumSelectOption));
    }, []);

    const handleChange = (id: string) => {
        const option = CLOTHING_QUALITIES.find(q => q.code === id);
        if (option) {
            onChange(option.name, option.code);
        } else {
            onChange("", "");
        }
    };

    return (
        <div className={className}>
            <PremiumSelect
                options={options}
                value={value}
                onChange={handleChange}
                placeholder="Выберите качество..."
                compact={compact}
                variant="default"
                autoLayout
            />
        </div>
    );
}

