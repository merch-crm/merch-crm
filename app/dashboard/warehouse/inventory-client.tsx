"use client";

import { useState } from "react";
import { Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getCategoryIcon, getColorStyles } from "./category-utils";

export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold: number;
    categoryId: string | null;
    description?: string | null;
    location?: string | null;
    image?: string | null;
    reservedQuantity?: number;
    attributes?: Record<string, string | number | boolean | null | undefined>;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    prefix?: string | null;
    parentId?: string | null;
    sortOrder?: number | null;
    isActive?: boolean | null;
    items?: InventoryItem[];
    parent?: Category | null;
}

interface InventoryClientProps {
    items: InventoryItem[];
    categories: Category[];
}

import { EditCategoryDialog } from "./edit-category-dialog";
import { deleteInventoryCategory } from "./actions";

export function InventoryClient({ items, categories }: InventoryClientProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const { toast } = useToast();

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

    const itemsByCategory = topLevelCategories.map(category => ({
        ...category,
        items: items.filter(item => {
            // Include items directly in this category
            if (item.categoryId === category.id) return true;
            // Also include items from ALL subcategories of this category for the count
            const childIds = subCategories.filter(sc => sc.parentId === category.id).map(sc => sc.id);
            return item.categoryId && childIds.includes(item.categoryId);
        }),
        children: subCategories.filter(sc => sc.parentId === category.id).map(sc => ({
            ...sc,
            items: items.filter(i => i.categoryId === sc.id)
        }))
    }));

    const orphanedItems = items.filter(item => !item.categoryId);

    const handleEditCategory = (cat: Category) => {
        if (cat.id === "orphaned") return;
        setEditingCategory(cat);
        setIsEditDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteInventoryCategory(categoryToDelete.id);
            if (result.success) {
                toast("Категория удалена", "success");
                setCategoryToDelete(null);
            } else {
                toast(result.error || "Ошибка при удалении", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {itemsByCategory.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={() => setCategoryToDelete(category)}
                    />
                ))}

                {orphanedItems.length > 0 && (
                    <CategoryCard
                        category={{
                            id: "orphaned",
                            name: "Без категории",
                            items: orphanedItems,
                            description: null,
                            color: "slate",
                            icon: "box"
                        }}
                    />
                )}
            </div>

            {editingCategory && (
                <EditCategoryDialog
                    key={editingCategory.id}
                    category={editingCategory}
                    categories={categories}
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                />
            )}

            <ConfirmDialog
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Удаление категории"
                description={`Вы уверены, что хотите удалить категорию "${categoryToDelete?.name}"? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />
        </>
    );
}

import { createElement } from "react";

function CategoryCard({
    category,
    onEdit,
    onDelete,
}: {
    category: Category & { items: InventoryItem[], children?: Category[] },
    onEdit?: (cat: Category) => void,
    onDelete?: () => void,
}) {
    const router = useRouter();
    const IconComponent = getCategoryIcon(category);
    const isOrphaned = category.id === "orphaned";
    const colorStyle = getColorStyles(category.color);

    const itemsForStatus = category.items;
    const hasCritical = itemsForStatus.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.criticalStockThreshold || 0));
    const hasLow = itemsForStatus.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.lowStockThreshold || 10));

    // Эти переменные были удалены из-за того, что они не использовались в текущем дизайне карточки.
    // В будущем их можно будет вернуть для индикации статуса склада на главной странице.

    return (
        <div
            onClick={() => {
                router.push(`/dashboard/warehouse/${category.id}`);
            }}
            className="group relative bg-white border border-slate-200/60 rounded-[32px] p-6 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:border-indigo-100 active:scale-[0.98] cursor-pointer flex flex-col gap-5 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg shadow-slate-100 group-hover:shadow-indigo-100",
                        colorStyle
                    )}>
                        {createElement(IconComponent, { className: "w-7 h-7" })}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight">
                            {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                                {category.items.length} ПОЗИЦИЙ
                            </span>
                        </div>
                    </div>
                </div>

                {!isOrphaned && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit(category);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="min-h-[3rem] relative z-10">
                {category.children && category.children.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {category.children.map(child => {
                            const childItems = child.items || [];
                            const hasChildCritical = childItems.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.criticalStockThreshold || 0));
                            const hasChildLow = childItems.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.lowStockThreshold || 10));

                            return (
                                <span
                                    key={child.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/warehouse/${child.id}`);
                                    }}
                                    className={cn(
                                        "inline-flex items-center px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all cursor-pointer uppercase tracking-tight",
                                        hasChildCritical
                                            ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100 hover:border-rose-200"
                                            : hasChildLow
                                                ? "bg-amber-50 border-amber-100 text-amber-500 hover:bg-amber-100 hover:border-amber-200"
                                                : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm"
                                    )}
                                >
                                    {child.name}
                                </span>
                            );
                        })}
                    </div>
                ) : category.description ? (
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                        {category.description}
                    </p>
                ) : (
                    <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Основная категория</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto relative z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Перейти</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-500">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

