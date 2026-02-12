"use client";

import { useState, useRef, useEffect, createElement } from "react";
import { ChevronDown, Check, Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "./types";
import { getCategoryIcon, getColorStyles } from "./category-utils";
import { GlassEmptyState } from "@/components/ui/glass-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategorySelectProps {
    categories: Category[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    excludeId?: string;
}

export function CategorySelect({ categories, value, onChange, placeholder = "Выберите категорию", disabled, excludeId }: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCategory = categories.find(c => c.id === value);

    // Filter parents and handle hierarchy
    const availableCategories = categories.filter(cat =>
        cat.id !== excludeId && (!cat.parentId || cat.parentId === "")
    );

    const filteredCategories = availableCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setSearchQuery("");
    };

    const iconComponent = selectedCategory ? getCategoryIcon(selectedCategory) : Package;

    return (
        <div className="relative" ref={containerRef}>
            <Button
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                className={cn(
                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border flex items-center justify-between transition-all outline-none group p-0 bg-transparent hover:bg-transparent shadow-none",
                    isOpen ? "border-primary ring-4 ring-primary/10 bg-white shadow-crm-md" : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-crm-sm",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="flex items-center gap-3">
                    {value ? (
                        <>
                            <div className={cn(
                                "w-7 h-7 rounded-[var(--radius-inner)] flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                getColorStyles(selectedCategory?.color)
                            )}>
                                {createElement(iconComponent, { className: "w-4 h-4" })}
                            </div>
                            <span className="font-bold text-slate-900">{selectedCategory?.name}</span>
                        </>
                    ) : (
                        <span className="font-bold text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
            </Button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 mt-3 z-[70] bg-white rounded-[var(--radius-inner)] border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 shadow-crm-xl"
                >
                    <div className="p-3 border-b border-slate-200 bg-slate-50/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск категории..."
                                className="w-full h-11 pl-9 pr-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto p-2 custom-scrollbar">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => {
                                const CatIcon = getCategoryIcon(cat);
                                const isSelected = value === cat.id;
                                const colorStyles = getColorStyles(cat.color);

                                return (
                                    <Button
                                        key={cat.id}
                                        onClick={() => handleSelect(cat.id)}
                                        variant="ghost"
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-[var(--radius-inner)] transition-all group h-auto mb-1 bg-transparent hover:bg-transparent shadow-none border-none",
                                            isSelected ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-[var(--radius-inner)] flex items-center justify-center shrink-0 shadow-sm transition-transform",
                                                colorStyles
                                            )}>
                                                {createElement(CatIcon, { className: "w-4 h-4" })}
                                            </div>
                                            <span className="font-bold text-sm ">{cat.name}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                                    </Button>
                                );
                            })
                        ) : (
                            <GlassEmptyState
                                icon={Package}
                                title="Ничего не найдено"
                                description="Попробуйте изменить поисковый запрос"
                                className="p-4"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

