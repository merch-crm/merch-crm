"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { CLOTHING_QUALITIES } from "./category-utils";
import { Select, SelectOption } from "@/components/ui/select";

interface QualityDropdownProps {
    value: string;
    onChange: (name: string, code: string) => void;
    options?: { name: string; code: string }[];
    className?: string; // Для внешней стилизации
    compact?: boolean;  // Режим компактного отображения для карточек
}

export function QualityDropdown({ value, onChange, options: externalOptions, className, compact = false }: QualityDropdownProps) {
    const finalOptions = externalOptions || CLOTHING_QUALITIES;

    const selectOptions = useMemo(() => {
        return finalOptions.map(q => ({
            id: q.code,
            title: q.name,
            description: q.code === "PRM" ? "Премиум материалы" : q.code === "BS" ? "Базовые материалы" : "Пользовательский вариант",
            icon: <Sparkles className="w-4 h-4 opacity-50" />
        } as SelectOption));
    }, [finalOptions]);

    const handleChange = (id: string) => {
        const option = finalOptions.find(q => q.code === id);
        if (option) {
            onChange(option.name, option.code);
        } else {
            onChange("", "");
        }
    };

    return (
        <div className={className}>
            <Select
                options={selectOptions}
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

