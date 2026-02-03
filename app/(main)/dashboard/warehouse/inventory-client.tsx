"use client";

import { useState } from "react";
import { Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getColorStyles } from "./category-utils";
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
        const children = subCategories.filter(sc => sc.parentId === category.id);
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--crm-grid-gap)]">
                {itemsByCategory.map((category) => {
                    const IconComponent = getCategoryIcon(category);
                    const isOrphaned = category.id === "orphaned";
                    const colorStyle = getColorStyles(category.color);

                    return (
                        <div
                            key={category.id}
                            onClick={() => {
                                router.push(`/dashboard/warehouse/${category.id}`);
                            }}
                            className="group crm-card cursor-pointer flex flex-col gap-4 focus:outline-none focus:ring-0 transition-all duration-500 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-14 h-14 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shadow-sm",
                                        colorStyle
                                    )}>
                                        <IconComponent className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 transition-colors leading-none">
                                            {category.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors duration-500">
                                                {category.itemCount || 0} {pluralize(category.itemCount || 0, 'позиция', 'позиции', 'позиций')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!isOrphaned && (
                                    <div className="flex items-center gap-1 transition-all duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCategory(category);
                                            }}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-[var(--radius-inner)] transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="min-h-[3rem] relative z-10">
                                {category.children && category.children.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {category.children.map(child => (
                                            <span
                                                key={child.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/warehouse/${child.id}`);
                                                }}
                                                className="inline-flex items-center px-4 py-2 rounded-[var(--radius-inner)] border text-xs font-medium transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900"
                                            >
                                                {child.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : category.description ? (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">
                                        {category.description}
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Основная категория</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 mt-auto relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all duration-500 group-hover:text-primary">Подробнее</span>
                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                                    <ChevronRight className="w-4 h-4 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {editingCategory && (
                <EditCategoryDialog
                    key={editingCategory.id}
                    category={editingCategory}
                    categories={categories}
                    isOpen={true}
                    onClose={() => setEditingCategory(null)}
                    user={user}
                />
            )}
        </>
    );
}
