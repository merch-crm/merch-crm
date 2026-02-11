"use client";

import { createElement } from "react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getColorStyles } from "../../../category-utils";
import { Category } from "../../../types";

interface CategorySelectorProps {
    categories: Category[];
    onSelect: (category: Category) => void;
    variant?: "default" | "compact";
    hideTitle?: boolean;
    selectedCategoryId?: string;
}

export function CategorySelector({ categories, onSelect, variant = "default", hideTitle = false, selectedCategoryId }: CategorySelectorProps) {
    return (
        <div className={cn("px-4 sm:px-10 pb-6", hideTitle ? "pt-2" : "pt-6 sm:pt-10")}>
            <div className="max-w-6xl mx-auto w-full space-y-6">
                {!hideTitle && (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Выберите тип позиции</h2>
                            <p className="text-[10px] font-bold text-slate-500 opacity-60 mt-1">От типа зависят доступные поля и характеристики</p>
                        </div>
                    </div>
                )}

                <div className={cn(
                    "grid gap-4",
                    variant === "default"
                        ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
                        : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full"
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
                                        "group flex flex-row items-center gap-3 p-4 rounded-2xl border border-slate-200 transition-all text-left shadow-sm",
                                        selectedCategoryId === category.id
                                            ? "border-slate-900 bg-slate-50 shadow-md"
                                            : "bg-white hover:border-slate-300 hover:shadow-md"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300",
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
                                    "group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-slate-200 transition-all text-center shadow-sm aspect-square xl:aspect-auto",
                                    selectedCategoryId === category.id
                                        ? "border-slate-900 bg-slate-50 shadow-md"
                                        : "bg-white hover:border-slate-300 hover:shadow-md"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 shadow-sm",
                                    colorStyle
                                )}>
                                    {createElement(IconComponent, { className: "w-7 h-7" })}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-1 break-words leading-tight">
                                        {category.name}
                                    </h3>

                                </div>

                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
