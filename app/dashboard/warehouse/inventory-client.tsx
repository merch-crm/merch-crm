"use client";

import { useState } from "react";
import { Package, Edit, Shirt, Hourglass, Wind, Layers, Zap, Scissors, Box, Pencil, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    categoryId: string | null;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    items?: InventoryItem[];
}

interface InventoryClientProps {
    items: InventoryItem[];
    categories: Category[];
}

import { EditCategoryDialog } from "./edit-category-dialog";

export function InventoryClient({ items, categories }: InventoryClientProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const itemsByCategory = categories.map(category => ({
        ...category,
        items: items.filter(item => item.categoryId === category.id)
    }));

    const orphanedItems = items.filter(item => !item.categoryId);

    const handleEditCategory = (cat: Category) => {
        if (cat.id === "orphaned") return;
        setEditingCategory(cat);
        setIsEditDialogOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                />
            )}
        </>
    );
}

// Map category names to icons


// Map category names to icons
const getCategoryIcon = (category: Partial<Category>) => {
    // If explicit icon is set, use it
    if (category.icon) {
        const icons: Record<string, typeof Package> = {
            "shirt": Shirt,
            "package": Package,
            "layers": Layers,
            "zap": Zap,
            "scissors": Scissors,
            "box": Box,
            "hourglass": Hourglass,
            "wind": Wind,
        };
        return icons[category.icon] || Package;
    }

    // Fallback to name-based mapping
    const iconMap: Record<string, typeof Package> = {
        "Футболки": Shirt,
        "Худи": Hourglass,
        "Свитшот": Layers,
        "Лонгслив": Shirt,
        "Анорак": Wind,
        "Зип-худи": Zap,
        "Штаны": Package,
        "Поло": Shirt,
        "Упаковка": Box,
        "Расходники": Scissors,
    };
    return iconMap[category.name || ""] || Package;
};

import { createElement } from "react";

function CategoryCard({
    category,
    onEdit,
}: {
    category: Category & { items: InventoryItem[] },
    onEdit?: (cat: Category) => void,
}) {
    const router = useRouter();
    const lowStockCount = category.items.filter((i) => i.quantity <= i.lowStockThreshold).length;
    const IconComponent = getCategoryIcon(category);
    const isOrphaned = category.id === "orphaned";

    // Helper for color styles
    const getColorStyles = (color: string | null | undefined) => {
        const c = color || "slate";
        const styles: Record<string, string> = {
            "slate": "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
            "red": "bg-red-100 text-red-600 group-hover:bg-red-200",
            "orange": "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
            "amber": "bg-amber-100 text-amber-600 group-hover:bg-amber-200",
            "yellow": "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200",
            "lime": "bg-lime-100 text-lime-600 group-hover:bg-lime-200",
            "green": "bg-green-100 text-green-600 group-hover:bg-green-200",
            "emerald": "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
            "teal": "bg-teal-100 text-teal-600 group-hover:bg-teal-200",
            "cyan": "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200",
            "sky": "bg-sky-100 text-sky-600 group-hover:bg-sky-200",
            "blue": "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
            "indigo": "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200",
            "violet": "bg-violet-100 text-violet-600 group-hover:bg-violet-200",
            "purple": "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
            "fuchsia": "bg-fuchsia-100 text-fuchsia-600 group-hover:bg-fuchsia-200",
            "pink": "bg-pink-100 text-pink-600 group-hover:bg-pink-200",
            "rose": "bg-rose-100 text-rose-600 group-hover:bg-rose-200",
        };
        return styles[c] || styles["slate"];
    };

    const colorStyle = getColorStyles(category.color);

    return (
        <div
            onClick={() => {
                try {
                    const params = new URLSearchParams();
                    params.set('category', category.id);
                    router.push(`/dashboard/warehouse?${params.toString()}`);
                } catch {
                    // Ignore navigation errors
                }
            }}
            className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                {!isOrphaned && onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(category);
                        }}
                        className="p-2 bg-white/80 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    colorStyle
                )}>
                    {createElement(IconComponent, { className: "w-5 h-5" })}
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {category.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {category.items.length} позиций
                        </span>
                        {lowStockCount > 0 && (
                            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none px-1.5 py-0 text-[9px] font-black uppercase ml-1">
                                {lowStockCount} Крит.
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn(
                "flex gap-2 transition-opacity",
                isOrphaned ? "hidden" : "opacity-0 group-hover:opacity-100"
            )}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(category);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </div>


            {/* Description */}
            <div className="mb-4 h-10 flex items-start">
                {category.description && (
                    <p className="text-[13px] text-slate-600 font-medium leading-tight line-clamp-2">
                        {category.description}
                    </p>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-auto">
                <button
                    className="w-full h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-between px-4 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 active:scale-[0.98]"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/warehouse/${category.id}`);
                    }}
                >
                    <span>Подробнее</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div >
    );
}

