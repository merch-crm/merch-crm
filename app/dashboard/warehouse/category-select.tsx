"use client";

import { useState, useRef, useEffect, createElement } from "react";
import { ChevronDown, Check, Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "./inventory-client";
import { getCategoryIcon, getColorStyles } from "./category-utils";

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
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-12 px-4 rounded-2xl border flex items-center justify-between transition-all outline-none group",
                    isOpen ? "border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-lg shadow-indigo-500/5" : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="flex items-center gap-3">
                    {value ? (
                        <>
                            <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors",
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
                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-indigo-500")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 z-[70] bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск категории..."
                                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all text-sm font-medium"
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
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleSelect(cat.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 group",
                                            isSelected ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                colorStyles
                                            )}>
                                                {createElement(CatIcon, { className: "w-4 h-4" })}
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400">Ничего не найдено</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

