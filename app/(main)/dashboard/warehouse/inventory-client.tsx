"use client";

import { useState } from "react";
import { Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getGradientStyles } from "./category-utils";
import { Session } from "@/lib/auth";
import { pluralize } from "@/lib/pluralize";

import { InventoryItem, Category } from "./types";
import { EditCategoryDialog } from "./edit-category-dialog";

interface InventoryClientProps {
    items?: InventoryItem[];
    categories: Category[];
    user: Session | null;
}

export function InventoryClient({ categories, user }: InventoryClientProps) {
    const router = useRouter();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const topLevelCategories = categories
        .filter(c => !c.parentId || c.parentId === "")
        .sort((a, b) => {
            const vA = a.sortOrder === 0 ? 999999 : (a.sortOrder || 999999);
            const vB = b.sortOrder === 0 ? 999999 : (b.sortOrder || 999999);
            return vA - vB;
        });

    const subCategories = categories
        .filter(c => c.parentId && c.parentId !== "")
        .sort((a, b) => {
            const vA = a.sortOrder === 0 ? 999999 : (a.sortOrder || 999999);
            const vB = b.sortOrder === 0 ? 999999 : (b.sortOrder || 999999);
            return vA - vB;
        });

    const itemsByCategory = topLevelCategories.map(category => {
        const children = subCategories
            .filter(sc => sc.parentId === category.id)
            .sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0));

        const totalItemsCount = (category.itemCount ?? 0) +
            children.reduce((sum, child) => sum + (child.itemCount ?? 0), 0);

        return {
            ...category,
            itemCount: totalItemsCount,
            children: children
        };
    });

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--crm-grid-gap)]">
                {itemsByCategory.map((category) => {
                    const IconComponent = getCategoryIcon(category);
                    const isOrphaned = category.id === "orphaned";

                    return (
                        <div
                            key={category.id}
                            onClick={() => router.push(`/dashboard/warehouse/${category.id}`)}
                            className="group relative flex flex-col h-full min-h-[220px] crm-card shadow-sm hover:shadow-md transition-all duration-300 p-0 overflow-hidden bg-white cursor-pointer"
                        >
                            {/* Header Variant B */}
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-white relative">
                                <div className="flex items-center gap-3.5">
                                    {/* Gradient Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-[14px] flex items-center justify-center text-white shadow-lg shrink-0 bg-gradient-to-br transition-all duration-500",
                                        getGradientStyles(category.color)
                                    )}>
                                        <IconComponent className="w-5 h-5 stroke-[2.5]" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-[17px] text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                            {category.name}
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                            {category.itemCount || 0} {pluralize(category.itemCount || 0, 'товаров', 'товара', 'товаров')}
                                        </span>
                                    </div>
                                </div>

                                {!isOrphaned && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCategory(category);
                                        }}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 opacity-0 group-hover:opacity-100"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Content Grid */}
                            <div className="flex-1 p-6 pt-4 flex flex-col">
                                {category.children && category.children.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Подкатегории</span>
                                            <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 rounded-md">{category.children.length}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.children.slice(0, 5).map(child => (
                                                <div
                                                    key={child.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/warehouse/${child.id}`);
                                                    }}
                                                    className="px-3 py-2 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-[10px] text-[11px] font-bold text-slate-600 hover:text-indigo-600 transition-all truncate hover:shadow-sm text-center"
                                                >
                                                    {child.name}
                                                </div>
                                            ))}
                                            {category.children.length > 5 && (
                                                <div className="px-3 py-2 flex items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[10px] text-[10px] font-bold text-slate-400">
                                                    +{category.children.length - 5} еще
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 h-full">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Описание</span>
                                        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 font-medium">
                                            {category.description || "Описание отсутствует"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Link */}
                            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between transition-colors group-hover:bg-indigo-50/30 mt-auto">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-indigo-600">Перейти в категорию</span>
                                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all shadow-sm">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <EditCategoryDialog
                category={editingCategory || categories[0]}
                categories={categories}
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                user={user}
            />
        </>
    );
}
