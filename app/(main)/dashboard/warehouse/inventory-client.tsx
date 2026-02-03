"use client";

import { useState } from "react";
import { Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getColorStyles } from "./category-utils";
import { Session } from "@/lib/auth";
import { pluralize } from "@/lib/pluralize";

import { InventoryItem, Category } from "./types";

interface InventoryClientProps {
    items: InventoryItem[];
    categories: Category[];
    user: Session | null;
}

import { EditCategoryDialog } from "./edit-category-dialog";

export function InventoryClient({ items, categories, user }: InventoryClientProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
        // Find subcategories
        const children = subCategories.filter(sc => sc.parentId === category.id);

        // Sum itemCount: category itself + its directly subcategories
        const totalItemsCount = (category as any).itemCount +
            children.reduce((sum, child) => sum + ((child as any).itemCount || 0), 0);

        return {
            ...category,
            itemCount: totalItemsCount,
            children: children
        };
    });


    const handleEditCategory = (cat: Category) => {
        if (cat.id === "orphaned") return;
        setEditingCategory(cat);
        setIsEditDialogOpen(true);
    };



    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--crm-grid-gap)]">
                {itemsByCategory.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEditCategory}
                    />
                ))}

            </div>
            {editingCategory && (
                <EditCategoryDialog
                    key={editingCategory.id}
                    category={editingCategory}
                    categories={categories}
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    user={user}
                />
            )}
        </>
    );
}

import { createElement } from "react";

function CategoryCard({
    category,
    onEdit,
}: {
    category: Category & { children?: Category[] },
    onEdit?: (cat: Category) => void,
}) {
    const router = useRouter();
    const IconComponent = getCategoryIcon(category);
    const isOrphaned = category.id === "orphaned";
    const colorStyle = getColorStyles(category.color);

    // Эти переменные были удалены из-за того, что они не использовались в текущем дизайне карточки.
    // В будущем их можно будет вернуть для индикации статуса склада на главной странице.

    return (
        <div
            onClick={() => {
                router.push(`/dashboard/warehouse/${category.id}`);
            }}
            className="group bg-white border border-slate-200 rounded-[var(--radius-outer)] p-6 cursor-pointer flex flex-col gap-4 overflow-hidden relative focus:outline-none focus:ring-0 transition-all duration-500 hover:border-primary/30"
        >

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "w-14 h-14 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shadow-sm",
                        colorStyle
                    )}>
                        {createElement(IconComponent, { className: "w-7 h-7" })}
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
                                if (onEdit) onEdit(category);
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
}

