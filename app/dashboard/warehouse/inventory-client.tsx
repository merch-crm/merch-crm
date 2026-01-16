"use client";

import { useState } from "react";
import { Pencil, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
        children: subCategories.filter(sc => sc.parentId === category.id)
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
    const lowStockCount = category.items.filter((i) => (i.quantity - (i.reservedQuantity || 0)) <= i.lowStockThreshold).length;
    const IconComponent = getCategoryIcon(category);
    const isOrphaned = category.id === "orphaned";
    const colorStyle = getColorStyles(category.color);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) onDelete();
    };

    const SYSTEM_CATEGORIES = [
        "Футболки", "Худи", "Свитшот", "Лонгслив", "Анорак",
        "Зип-худи", "Штаны", "Поло", "Кепки", "Упаковка", "Расходники", "Без категории"
    ];
    const isSystem = SYSTEM_CATEGORIES.includes(category.name);

    return (
        <div
            onClick={() => {
                router.push(`/dashboard/warehouse/${category.id}`);
            }}
            className="group relative bg-white border border-slate-200/60 rounded-[32px] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 active:scale-[0.98] cursor-pointer flex flex-col gap-4"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        colorStyle
                    )}>
                        {createElement(IconComponent, { className: "w-6 h-6" })}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                            {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-slate-400 tracking-widest">
                                {category.parent && (
                                    <span className="text-indigo-400 group-hover:text-indigo-500 transition-colors">
                                        {category.parent.name} /{" "}
                                    </span>
                                )}
                                {category.items.length} позиций
                            </span>
                            {lowStockCount > 0 && (
                                <Badge className="bg-rose-50 text-rose-600 border-none px-1.5 py-0 text-[9px] font-black pointer-events-none">
                                    {lowStockCount} Крит.
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {!isOrphaned && (
                    <div className="flex items-center gap-1 transition-opacity duration-300">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit(category);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        {!isSystem && (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="min-h-[2.5rem]">
                {category.children && category.children.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {category.children.map(child => (
                            <span
                                key={child.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/warehouse/${child.id}`);
                                }}
                                className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors cursor-pointer"
                            >
                                {child.name}
                            </span>
                        ))}
                    </div>
                ) : category.description ? (
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {category.description}
                    </p>
                ) : (
                    !isOrphaned && (
                        <p className="text-[13px] text-slate-300 font-medium">
                            Нет подкатегорий
                        </p>
                    )
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="text-[11px] font-black tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Подробнее
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
}

