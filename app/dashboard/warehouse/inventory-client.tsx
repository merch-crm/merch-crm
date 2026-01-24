"use client";

import { useState } from "react";
import { Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getCategoryIcon, getColorStyles } from "./category-utils";
import { Session } from "@/lib/auth";
import { pluralize } from "@/lib/pluralize";

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
    imageBack?: string | null;
    imageSide?: string | null;
    imageDetails?: string[] | null;
    reservedQuantity?: number;
    qualityCode?: string | null;
    materialCode?: string | null;
    attributeCode?: string | null;
    sizeCode?: string | null;
    storageLocationId?: string | null;
    attributes?: Record<string, string | number | boolean | null | undefined>;
    categoryName?: string;
    categorySingularName?: string | null;
    categoryPluralName?: string | null;
    isArchived: boolean;
    archivedAt?: Date | string | null;
    archiveReason?: string | null;
    category?: Category;
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
    isSystem?: boolean;
    gender?: string;
    singularName?: string | null;
    pluralName?: string | null;
    slug?: string | null;
    fullPath?: string | null;
    items?: InventoryItem[];
    parent?: Category | null;
}

interface InventoryClientProps {
    items: InventoryItem[];
    categories: Category[];
    user: Session | null;
}

import { EditCategoryDialog } from "./edit-category-dialog";
import { deleteInventoryCategory } from "./actions";

export function InventoryClient({ items, categories, user }: InventoryClientProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {itemsByCategory.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={handleEditCategory}
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
                    user={user}
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
}: {
    category: Category & { items: InventoryItem[], children?: Category[] },
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
            className="group glass-panel p-6 md:p-8 cursor-pointer flex flex-col gap-4 overflow-hidden relative border-white/60 hover:border-primary/30 rounded-[32px] shadow-crm-md hover:shadow-crm-lg"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "w-16 h-16 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg shadow-black/5",
                        colorStyle // Keeping original logic but can be enhanced if needed
                    )}>
                        {createElement(IconComponent, { className: "w-7 h-7" })}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-none">
                            {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-slate-400">
                                {category.items.length} {pluralize(category.items.length, 'позиция', 'позиции', 'позиций')}
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
                                className="inline-flex items-center px-4 py-2 rounded-[var(--radius-inner)] border text-xs font-medium transition-all cursor-pointer bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:text-primary hover:border-primary/20 hover:shadow-sm"
                            >
                                {child.name}
                            </span>
                        ))}
                    </div>
                ) : category.description ? (
                    <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                        {category.description}
                    </p>
                ) : (
                    <div className="flex items-center gap-2 text-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                        <span className="text-xs font-medium text-slate-400">Основная категория</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 mt-auto relative z-10">
                <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors tracking-wide">ПОДРОБНЕЕ</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

