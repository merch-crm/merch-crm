"use client";

import { createElement } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getColorStyles } from "../../../category-utils";

interface Category {
    id: string;
    name: string;
    description: string | null;
    prefix: string | null;
    parentId?: string | null;
    color: string | null;
    icon: string | null;
}

interface CategorySelectorProps {
    categories: Category[];
    onSelect: (category: Category) => void;
    variant?: "default" | "compact";
    hideTitle?: boolean;
    selectedCategoryId?: string;
}

export function CategorySelector({ categories, onSelect, variant = "default", hideTitle = false, selectedCategoryId }: CategorySelectorProps) {
    return (
        <div className={cn("p-6", variant === "compact" && "p-4")}>
            {!hideTitle && (
                <div className="mb-4 text-center">
                    <h2 className="text-xl font-black text-slate-900 mb-1">Выберите тип позиции</h2>
                    <p className="text-xs text-slate-500 font-medium">От типа зависят доступные поля и характеристики</p>
                </div>
            )}

            <div className={cn(
                "grid gap-4 mx-auto",
                variant === "default"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full"
            )}>
                {categories.map((category) => {
                    const IconComponent = getCategoryIcon(category);
                    const colorStyle = getColorStyles(category.color);

                    if (variant === "compact") {
                        return (
                            <button
                                key={category.id}
                                onClick={() => onSelect(category)}
                                className={cn(
                                    "group flex flex-row items-center gap-3 p-3 rounded-[14px] border transition-all text-left shadow-sm hover:shadow-md",
                                    selectedCategoryId === category.id
                                        ? "border-indigo-600 bg-indigo-50/50 shadow-indigo-100"
                                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 duration-300",
                                    colorStyle
                                )}>
                                    {createElement(IconComponent, { className: "w-5 h-5" })}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                        {category.name}
                                    </h3>
                                </div>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelect(category)}
                            className={cn(
                                "group flex flex-col items-center gap-3 p-4 rounded-[14px] border-2 transition-all text-center",
                                selectedCategoryId === category.id
                                    ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50 scale-[1.02]"
                                    : "border-slate-100 bg-white hover:border-indigo-300 hover:bg-slate-50/50"
                            )}
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-110 duration-500 shadow-md",
                                colorStyle
                            )}>
                                {createElement(IconComponent, { className: "w-7 h-7" })}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                                    {category.name}
                                </h3>
                                {category.description && (
                                    <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                        {category.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                                <span>Выбрать</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
