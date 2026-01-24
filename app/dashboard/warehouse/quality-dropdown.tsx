"use client";

import React, { useState } from "react";
import { Sparkles, Check, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLOTHING_QUALITIES } from "./category-utils";

interface QualityDropdownProps {
    value: string;
    onChange: (name: string, code: string) => void;
    className?: string; // Для внешней стилизации
    compact?: boolean;  // Режим компактного отображения для карточек
}

export function QualityDropdown({ value, onChange, className, compact = false }: QualityDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedQuality = CLOTHING_QUALITIES.find(q => q.code === value);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={cn("relative group/quality-selector", className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={toggleOpen}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className={cn(
                    "w-full flex items-center gap-3 bg-white rounded-[var(--radius)] border transition-all duration-300 group",
                    isOpen
                        ? "border-slate-900 ring-2 ring-slate-900/5 z-20 relative"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    compact ? "h-10 px-2 text-xs" : "h-12 px-4"
                )}
            >
                {!compact && (
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        value === "PRM" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                        <Sparkles className="w-4 h-4" />
                    </div>
                )}

                <div className="flex-1 text-left min-w-0">
                    <span className={cn(
                        "block font-bold text-slate-900 truncate",
                        compact ? "text-[13px]" : "text-xs"
                    )}>
                        {selectedQuality?.name || "Не выбрано"}
                    </span>
                    {!compact && (
                        <span className="block text-[10px] font-medium text-slate-400 truncate">
                            {value === "PRM" ? "Премиум материалы" : "Базовые материалы"}
                        </span>
                    )}
                </div>

                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0",
                    isOpen ? "rotate-180" : ""
                )} />
            </button>

            {/* Dark Dropdown Menu */}
            <div className={cn(
                "absolute top-full left-0 mt-2 min-w-[200px] bg-[#2C2C2E] p-1.5 rounded-xl shadow-crm-xl border border-white/5 backdrop-blur-xl z-[50] transition-all duration-200 origin-top-left",
                isOpen
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none",
                // Если компактный режим, меню может быть шире чем кнопка
                compact ? "w-[200px]" : "w-full"
            )}>
                <div className="space-y-1">
                    {/* Reset Option (Minus) */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            onChange("", "");
                            setIsOpen(false);
                        }}
                        className="w-full h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    {/* Options */}
                    {CLOTHING_QUALITIES.map(q => {
                        const isSelected = value === q.code;

                        return (
                            <button
                                key={q.name}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onChange(q.name, q.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-2.5 flex items-center gap-3 rounded-[8px] transition-all relative overflow-hidden group/item",
                                    isSelected
                                        ? "bg-[#3A82F6] text-white shadow-lg shadow-blue-500/20"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                <span className="text-[13px] font-medium leading-none">
                                    {q.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
