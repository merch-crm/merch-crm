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
    triggerClassName?: string;
    name?: string;
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
    center = false,
    triggerClassName,
    name,
    align = "start"
}: PremiumSelectProps & { align?: "start" | "center" | "end" }) {
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
                <label className="block text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest leading-none mb-1.5">
                    {label}
                </label>
            )}

            {name && <input type="hidden" name={name} value={value} />}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "w-full transition-all group disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
                            (center || variant === "minimal") ? "justify-center" : "justify-between",
                            variant === "default" ? [
                                "bg-background border border-border rounded-[var(--radius-inner)] shadow-sm hover:shadow-md",
                                compact ? "h-10 px-3.5" : "h-11 px-4",
                                open && "ring-4 ring-primary/5 border-primary/20 shadow-md"
                            ] : [
                                "bg-background rounded-[var(--radius-inner)] h-11 px-5 border border-border hover:border-border/80",
                                open && "ring-4 ring-primary/5 border-primary/20"
                            ],
                            triggerClassName
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={cn(
                                "font-bold transition-colors truncate",
                                compact ? "text-[12px]" : "text-sm",
                                selectedOption ? "text-foreground" : "text-muted-foreground"
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
                            "text-muted-foreground transition-transform duration-300 shrink-0 ml-1.5",
                            variant === "minimal" ? "w-3 h-3" : "w-3.5 h-3.5",
                            open && "rotate-180 text-primary"
                        )} />
                    </button>
                </PopoverTrigger>
                <AnimatePresence>
                    {open && (
                        <PopoverContent
                            className="p-0 bg-transparent border-none shadow-crm-xl w-auto overflow-visible duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
                            align={align}
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
                                    "rounded-[22px] bg-popover border border-border overflow-hidden shadow-crm-xl ring-1 ring-black/[0.03]",
                                    variant === "minimal" ? "min-w-[140px]" : "min-w-[var(--radix-popover-trigger-width)]"
                                )}>
                                <div className="p-2.5 flex flex-col max-h-[340px] w-full h-full gap-2">
                                    {effectiveShowSearch && (
                                        <div className="px-0.5 pb-2.5 border-b border-border mb-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder={searchPlaceholder}
                                                    className="w-full h-10 pl-9 pr-3 rounded-[12px] bg-muted border-none outline-none text-xs font-bold placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/5 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-y-auto scrollbar-hide flex-1">
                                        {filteredOptions.length > 0 ? (
                                            <div className={cn(
                                                "p-0",
                                                effectiveGridColumns ? [
                                                    "grid gap-2",
                                                    effectiveGridColumns === 2 ? "grid-cols-2" : "grid-cols-3"
                                                ] : "flex flex-col gap-1"
                                            )}>
                                                {filteredOptions.map((option) => {
                                                    const isSelected = option.id === value;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => handleSelect(option.id)}
                                                            className={cn(
                                                                "transition-all text-left group/item rounded-[var(--radius-inner)] border",
                                                                effectiveGridColumns ? [
                                                                    "flex flex-col items-center justify-center p-3 gap-1",
                                                                    isSelected ? "bg-primary/5 ring-2 ring-primary/20 border-primary/20" : "bg-muted/50 hover:bg-muted border-border"
                                                                ] : [
                                                                    "flex items-center gap-2 p-2.5",
                                                                    isSelected ? "bg-primary/5 border-primary/10" : "border-transparent hover:bg-muted hover:border-border"
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
                                                                    isSelected ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "bg-muted-foreground/30"
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
                                                                            effectiveGridColumns ? "text-[13px]" : "text-[13px] whitespace-nowrap",
                                                                            isSelected ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                                                                        )}>
                                                                            {option.title}
                                                                        </span>
                                                                        {option.badge && (
                                                                            <span className={cn(
                                                                                "text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                                                                isSelected ? "bg-background text-foreground shadow-sm" : "bg-primary/10 text-primary"
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
                                                <p className="text-[11px] font-bold text-muted-foreground/50 tracking-wider">НИЧЕГО НЕ НАЙДЕНО</p>
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
