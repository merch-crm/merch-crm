"use client";

import React, { useState, useMemo, useId } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export interface SelectOption {
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
function getOptimalLayout(options: SelectOption[]): LayoutType {
    const count = options.length;
    if (count === 0) return "list";

    const avgLength = options.reduce((sum, o) => sum + o.title.length, 0) / count;

    if (count <= 3) return "list";
    if (avgLength <= 4 && count <= 15) return "grid-3";
    if (avgLength <= 10 && count <= 8) return "grid-2";
    if (count > 15) return "list-with-search";
    return "list";
}

interface SelectAppearance {
    className?: string;
    compact?: boolean;
    variant?: "default" | "minimal";
    center?: boolean;
    triggerClassName?: string;
    align?: "start" | "center" | "end";
    alignOffset?: number;
}

interface SelectSearch {
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export interface SelectProps extends SelectAppearance, SelectSearch {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    gridColumns?: 2 | 3;
    autoLayout?: boolean;
    name?: string;
}

export function Select({
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
    align = "start",
    alignOffset = 0
}: SelectProps) {
    const triggerId = useId();
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
        Boolean(opt.id) &&
        (opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
        setSearchQuery("");
    };

    return (
        <div className={cn("relative", variant === "default" && "space-y-1.5", className)}>
            {label && (
                <label
                    htmlFor={triggerId}
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                >
                    {label}
                </label>
            )}

            {name && <input type="hidden" name={name} value={value} />}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        id={triggerId}
                        type="button"
                        disabled={disabled}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className={cn("w-full px-4 h-10 bg-slate-50/50 border border-slate-200/60 rounded-xl text-left transition-all focus:outline-none group/btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
                            (center || variant === "minimal") ? "justify-center" : "justify-between",
                            variant === "default" ? [
                                compact ? "h-9 px-3 text-[12px]" : "h-10 text-[13px] font-semibold",
                                open ? "border-indigo-500 bg-white ring-4 ring-indigo-500/5 shadow-sm" : "hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                            ] : ["bg-slate-50/50 rounded-xl h-10 border border-transparent hover:border-slate-200 shadow-sm",
                                open && "ring-4 ring-indigo-500/10 border-indigo-500/40 bg-white"
                            ],
                            triggerClassName
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden items-center w-full">
                            {selectedOption?.icon && !compact && variant !== "minimal" && (
                                <div className={cn("shrink-0 transition-colors", open ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")}>
                                    {selectedOption.icon}
                                </div>
                            )}
                            {selectedOption?.icon && compact && (
                                <div className={cn("shrink-0 transition-colors", open ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")}>
                                    {selectedOption.icon}
                                </div>
                            )}
                            {selectedOption ? (
                                <div className="flex min-w-0 w-full flex-col truncate">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={cn("font-bold transition-colors truncate",
                                            compact ? "text-xs" : "text-[13px]",
                                            open ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                                        )}>
                                            {selectedOption.title}
                                        </span>
                                        {selectedOption?.badge && !compact && variant !== "minimal" && (
                                            <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0 border border-indigo-100/50">
                                                {selectedOption.badge}
                                            </span>
                                        )}
                                    </div>
                                    {selectedOption.description && !effectiveGridColumns && (
                                        <span className="text-[11px] font-medium text-slate-400 truncate w-full block mt-0.5">
                                            {selectedOption.description}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className={cn("font-bold transition-colors truncate",
                                    compact ? "text-xs" : "text-[13px] text-slate-400/80"
                                )}>
                                    {placeholder}
                                </span>
                            )}
                        </div>
                        <ChevronDown className={cn("transition-transform duration-200 shrink-0 ml-1.5",
                            variant === "minimal" ? "w-3 h-3" : "w-4 h-4",
                            open ? "rotate-180 text-indigo-600 font-black" : "text-slate-300 group-hover:text-slate-400"
                        )} strokeWidth={3} />
                    </button>
                </PopoverTrigger>
                <AnimatePresence>
                    {open && (
                        <PopoverContent
                            className="p-0 bg-white border-none shadow-2xl w-auto overflow-visible duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
                            align={align}
                            alignOffset={alignOffset}
                            sideOffset={6}
                            collisionPadding={8}
                            forceMount
                            asChild
                        >
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0.95, y: -4, originY: 0 }}
                                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                                exit={{ opacity: 0, scaleY: 0.95, y: -4 }}
                                transition={{
                                    duration: 0.2,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className={cn("rounded-xl bg-white border border-slate-200/80 overflow-hidden shadow-[0_15px_45px_-12px_rgba(0,0,0,0.1)] z-50",
                                    variant === "minimal" ? "min-w-[140px]" : "min-w-[var(--radix-popover-trigger-width)]"
                                )}>
                                <div className="p-1 flex flex-col max-h-[350px] w-full h-full">
                                    {effectiveShowSearch && (
                                        <div className="pb-2 border-b border-slate-100 mb-2 block px-1 pt-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <Input
                                                    autoFocus
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder={searchPlaceholder}
                                                    aria-label={searchPlaceholder}
                                                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200/60 shadow-none text-xs font-bold focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-indigo-500/5 focus-visible:border-indigo-400 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-y-auto scrollbar-hide flex-1 px-1" role="listbox">
                                        {filteredOptions.length > 0 ? (
                                            <div className={cn("w-full",
                                                effectiveGridColumns ? ["grid gap-1.5",
                                                    effectiveGridColumns === 2 ? "grid-cols-2" : "grid-cols-3"
                                                ] : "flex flex-col space-y-0.5"
                                            )}>
                                                {filteredOptions.map((option, index) => {
                                                    const isSelected = option.id === value;
                                                    const isLastOdd = effectiveGridColumns === 2 && index === filteredOptions.length - 1 && filteredOptions.length % 2 !== 0;

                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            onClick={() => handleSelect(option.id)}
                                                            className={cn("transition-all relative text-left outline-none cursor-pointer focus:outline-none group/item",
                                                                effectiveGridColumns ? ["h-10 rounded-lg text-xs font-bold flex items-center justify-center",
                                                                    isLastOdd ? "col-span-2" : "",
                                                                    isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "bg-white border border-slate-200/60 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                                ] : ["flex items-center justify-between gap-3 px-3 py-2 rounded-lg",
                                                                    isSelected ? "bg-indigo-50/80 text-indigo-900 shadow-sm" : "hover:bg-slate-50 focus:bg-slate-50 text-slate-700 hover:text-slate-900"
                                                                ]
                                                            )}
                                                        >
                                                            {/* Grid layout content */}
                                                            {effectiveGridColumns && (
                                                                <div className="flex items-center justify-center gap-1.5 px-2 max-w-full">
                                                                    <span className="truncate">{option.title}</span>
                                                                    {isSelected && <Check className="w-3 h-3 text-white/90 stroke-[3] shrink-0" />}
                                                                </div>
                                                            )}

                                                            {/* List layout content */}
                                                            {!effectiveGridColumns && (
                                                                <>
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        {/* Style indicator based on type */}
                                                                        {(option.color || option.icon) ? (
                                                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all border",
                                                                                isSelected ? "bg-white border-indigo-200 text-indigo-600 shadow-sm" : "bg-slate-100 border-slate-200/50 text-slate-500 group-hover/item:border-slate-300 group-hover/item:bg-white",
                                                                                option.color && "p-0 border-black/5 overflow-hidden ring-1 ring-inset ring-black/5"
                                                                            )}>
                                                                                {option.color ? (
                                                                                    <div className="w-full h-full rounded-[7px] scale-90 shadow-sm" style={{ backgroundColor: option.color }} />
                                                                                ) : (
                                                                                    <div className="[&>svg]:w-4 [&>svg]:h-4">{option.icon}</div>
                                                                                )}
                                                                            </div>
                                                                        ) : null}

                                                                        <div className="flex flex-col min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={cn("text-[13px] font-bold truncate", isSelected ? "text-indigo-900" : "")}>
                                                                                    {option.title}
                                                                                </span>
                                                                                {option.badge && (
                                                                                    <span className={cn("text-[11px] font-black px-1.5 py-0.5 rounded-full shrink-0",
                                                                                        isSelected ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-200 text-slate-500 group-hover/item:bg-slate-300 group-hover/item:text-slate-600"
                                                                                    )}>
                                                                                        {option.badge}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {option.description && (
                                                                                <div className={cn("text-[11px] font-medium leading-tight truncate mt-0.5", isSelected ? "text-indigo-600/80" : "text-slate-400")}>
                                                                                    {option.description}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {/* Checkmark for list view */}
                                                                    {isSelected && (
                                                                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                                                            <Check className="w-3 h-3 text-white stroke-[3] shrink-0" />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center">
                                                <p className="text-xs font-bold text-muted-foreground/50">Ничего не найдено</p>
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


