"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { AnimatePresence, motion } from "framer-motion";

export interface PremiumSelectOption {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
    badge?: string | number;
}

type LayoutType = "list" | "grid-2" | "grid-3" | "list-with-search";

/**
 * Автоматически определяет оптимальный layout для выпадающего списка
 * Правила:
 * - 1-3 опции: вертикальный список
 * - 4-8 опций со средней длиной текста ≤10: grid 2 колонки
 * - 9-15 опций с короткой длиной текста ≤4: grid 3 колонки
 * - 16+ опций: вертикальный список с поиском
 */
function getOptimalLayout(options: PremiumSelectOption[]): LayoutType {
    const count = options.length;
    if (count === 0) return "list";

    const avgLength = options.reduce((sum, o) => sum + o.title.length, 0) / count;

    if (count <= 3) return "list";
    if (avgLength <= 4 && count <= 15) return "grid-3";
    if (avgLength <= 10 && count <= 8) return "grid-2";
    if (count > 15) return "list-with-search";
    return "list";
}

interface PremiumSelectProps {
    options: PremiumSelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    compact?: boolean;
    variant?: "default" | "minimal";
    gridColumns?: 2 | 3;
    autoLayout?: boolean; // Включить автоматический выбор layout
    center?: boolean; // Центрировать содержимое
}

export function PremiumSelect({
    options,
    value,
    onChange,
    label,
    placeholder = "Выберите опцию",
    className,
    disabled = false,
    showSearch,
    searchPlaceholder = "Поиск...",
    compact = false,
    variant = "default",
    gridColumns,
    autoLayout = true,
    center = false
}: PremiumSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Автоматическое определение layout
    const computedLayout = useMemo(() => {
        if (gridColumns) {
            return gridColumns === 2 ? "grid-2" : "grid-3";
        }
        if (!autoLayout) return "list";
        return getOptimalLayout(options);
    }, [options, gridColumns, autoLayout]);

    const effectiveGridColumns = computedLayout === "grid-2" ? 2 : computedLayout === "grid-3" ? 3 : undefined;
    const effectiveShowSearch = showSearch ?? (computedLayout === "list-with-search");

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
        setSearchQuery("");
    };

    return (
        <div className={cn("relative", variant === "default" && "space-y-1.5", className)}>
            {label && (
                <label className="block text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest leading-none mb-1.5">
                    {label}
                </label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "w-full transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
                            (center || variant === "minimal") ? "justify-center" : "justify-between",
                            variant === "default" ? [
                                "bg-white border border-slate-200 rounded-[var(--radius-inner)] shadow-sm hover:shadow-md",
                                compact ? "h-10 px-3.5" : "h-11 px-4",
                                open && "ring-4 ring-primary/5 border-primary/20 shadow-md"
                            ] : [
                                "bg-white rounded-[var(--radius-inner)] shadow-sm hover:shadow-md h-11 px-5 border-none",
                                open && "shadow-md ring-4 ring-primary/5 border-primary/20"
                            ]
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={cn(
                                "font-bold transition-colors truncate",
                                compact ? "text-[12px]" : "text-[13px]",
                                selectedOption ? "text-slate-900" : "text-slate-400"
                            )}>
                                {selectedOption ? selectedOption.title : placeholder}
                            </span>
                            {selectedOption?.badge && !compact && variant !== "minimal" && (
                                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                        <ChevronDown className={cn(
                            "text-slate-400 transition-transform duration-300 shrink-0 ml-1.5",
                            variant === "minimal" ? "w-3 h-3" : "w-3.5 h-3.5",
                            open && "rotate-180 text-primary"
                        )} />
                    </button>
                </PopoverTrigger>
                <AnimatePresence>
                    {open && (
                        <PopoverContent
                            className="p-0 bg-transparent border-none shadow-none w-auto overflow-visible duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
                            align="start"
                            sideOffset={8}
                            forceMount
                            asChild
                        >
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0.8, y: -10, originY: 0 }}
                                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                                exit={{ opacity: 0, scaleY: 0.8, y: -10 }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.23, 1, 0.32, 1],
                                    opacity: { duration: 0.2 }
                                }}
                                className={cn(
                                    "rounded-[18px] bg-white !shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25),0_4px_16px_-4px_rgba(0,0,0,0.1)] border border-slate-200/60",
                                    variant === "minimal" ? "min-w-[140px]" : "min-w-[var(--radix-popover-trigger-width)]"
                                )}>
                                <div className={cn(
                                    "bg-white rounded-[var(--radius-outer)] p-1.5 overflow-hidden flex flex-col max-h-[300px]",
                                    "w-full h-full"
                                )}>
                                    {effectiveShowSearch && (
                                        <div className="p-1.5 border-b border-slate-200 mb-1">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder={searchPlaceholder}
                                                    className="w-full h-9 pl-8 pr-3 rounded-[var(--radius-inner)] bg-slate-50 border-none outline-none text-xs font-bold placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-y-auto scrollbar-hide flex-1">
                                        {filteredOptions.length > 0 ? (
                                            <div className={cn(
                                                "p-0.5",
                                                effectiveGridColumns ? [
                                                    "grid gap-1.5",
                                                    effectiveGridColumns === 2 ? "grid-cols-2" : "grid-cols-3"
                                                ] : "flex flex-col gap-0.5"
                                            )}>
                                                {filteredOptions.map((option) => {
                                                    const isSelected = option.id === value;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => handleSelect(option.id)}
                                                            className={cn(
                                                                "transition-all text-left group/item",
                                                                effectiveGridColumns ? [
                                                                    "flex flex-col items-center justify-center p-3 rounded-[var(--radius-inner)] gap-1",
                                                                    isSelected ? "bg-primary/10 ring-2 ring-primary/30" : "bg-slate-50 hover:bg-slate-100"
                                                                ] : [
                                                                    "flex items-center gap-2 p-2.5 rounded-[var(--radius-inner)]",
                                                                    isSelected ? "bg-primary/5" : "hover:bg-slate-50"
                                                                ]
                                                            )}
                                                        >
                                                            {/* Color circle for grid mode */}
                                                            {effectiveGridColumns && option.color && (
                                                                <div
                                                                    className="w-7 h-7 rounded-full shrink-0 shadow-sm ring-1 ring-black/5"
                                                                    style={{
                                                                        backgroundColor: option.color,
                                                                        border: '2px solid #fff',
                                                                        outline: '1px solid rgba(0,0,0,0.05)'
                                                                    }}
                                                                />
                                                            )}
                                                            {/* Dot indicator for list mode (without color) */}
                                                            {!effectiveGridColumns && !option.color && (
                                                                <div className={cn(
                                                                    "w-2 h-2 rounded-full shrink-0",
                                                                    isSelected ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "bg-slate-200"
                                                                )} />
                                                            )}
                                                            {/* Color circle for list mode */}
                                                            {!effectiveGridColumns && option.color && (
                                                                <div
                                                                    className="w-7 h-7 rounded-full shrink-0 shadow-sm ring-1 ring-black/5"
                                                                    style={{
                                                                        backgroundColor: option.color,
                                                                        border: '2px solid #fff',
                                                                        outline: '1px solid rgba(0,0,0,0.05)'
                                                                    }}
                                                                />
                                                            )}
                                                            <div className={cn(
                                                                effectiveGridColumns ? "flex flex-col items-center text-center" : "flex flex-col flex-1 min-w-0"
                                                            )}>
                                                                <div className={cn(
                                                                    effectiveGridColumns ? "flex items-center gap-1" : "flex items-center justify-between gap-2"
                                                                )}>
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className={cn(
                                                                            "font-bold leading-none",
                                                                            effectiveGridColumns ? "text-[13px]" : "text-[12px] whitespace-nowrap",
                                                                            isSelected ? "text-primary" : "text-slate-900"
                                                                        )}>
                                                                            {option.title}
                                                                        </span>
                                                                        {option.badge && (
                                                                            <span className={cn(
                                                                                "text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                                                                isSelected ? "bg-white text-slate-900 shadow-sm" : "bg-primary/10 text-primary"
                                                                            )}>
                                                                                {option.badge}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {isSelected && (
                                                                        <Check className={cn(
                                                                            "text-primary shrink-0",
                                                                            effectiveGridColumns ? "w-3.5 h-3.5" : "w-3 h-3"
                                                                        )} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center">
                                                <p className="text-[11px] font-bold text-slate-300 tracking-wider">НИЧЕГО НЕ НАЙДЕНО</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </PopoverContent>
                    )}
                </AnimatePresence>
            </Popover>
        </div>
    );
}
