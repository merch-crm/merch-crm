"use client";

import React from "react";
import { GripVertical, Pencil, ChevronRight } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Category } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getHexColor } from "@/app/(main)/dashboard/warehouse/category-utils";

interface NavigationRouter {
    push: (href: string) => void;
}

interface CategoryCardProps {
    category: CategoryWithChildren;
    router: NavigationRouter;
    setEditingCategory: (cat: Category) => void;
}

export const SortableCategoryCard = React.memo(({
    category,
    router,
    setEditingCategory,
}: CategoryCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/dashboard/warehouse/categories/${category.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/dashboard/warehouse/categories/${category.id}`);
                }
            }}
            className={cn(
                "group crm-card relative overflow-hidden rounded-[24px] sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-full w-full transition-all duration-500 hover:shadow-2xl cursor-pointer bg-white",
                "p-0",
                isDragging && "opacity-0 scale-95"
            )}
        >
            <CategoryCardContent
                category={category}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
                onEdit={() => setEditingCategory(category)}
            />
        </div>
    );
});

SortableCategoryCard.displayName = "SortableCategoryCard";

interface CategoryWithChildren extends Category {
    children?: Category[];
}

interface CategoryCardContentProps {
    category: CategoryWithChildren;
    isDragging?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onEdit?: () => void;
}

export const CategoryCardContent = React.memo(({
    category,
    isDragging,
    dragHandleProps,
    onEdit,
}: CategoryCardContentProps) => {
    const IconComponent = getCategoryIcon(category);
    const color = category.color || "slate";
    const hexColor = getHexColor(color);
    const isOrphaned = category.id === "orphaned";

    return (
        <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-center">
            {/* Drag Handle (Absolute) */}
            {!isOrphaned && (
                <div role="button" tabIndex={0}
                    {...dragHandleProps}
                    aria-label="Перетащить для изменения порядка"
                    className={cn(
                        "absolute top-5 left-5 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-all rounded-lg opacity-0 group-hover:opacity-100",
                        isDragging && "cursor-grabbing text-primary opacity-100"
                    )}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-5 h-5" />
                </div>
            )}

            {/* Edit Button (Absolute) */}
            {!isOrphaned && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full text-slate-300 hover:text-slate-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            )}

            {/* Adaptive layout container */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-8 w-full py-4">

                {/* Column 1: Identity */}
                <div className="flex flex-col items-center justify-center flex-1 min-w-[240px] max-w-[400px]">
                    <div
                        className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white mb-5 transition-transform group-hover:scale-[1.03]"
                        style={{ backgroundColor: hexColor }}
                    >
                        <IconComponent className="w-8 h-8 stroke-[1.5]" />
                    </div>

                    <h3 className="text-[22px] font-black text-slate-900 leading-tight mb-1 text-center">
                        {category.name}
                    </h3>

                    <p className="text-[12px] font-semibold text-slate-400 text-center">
                        {category.itemCount || 0} активных SKU на складе
                    </p>
                </div>

                {/* Column 2: Subcategories List - Structured Grid */}
                <div className="flex flex-col items-start justify-center flex-1 min-w-[300px] max-w-[450px] border-y border-slate-100/80 py-6 my-auto lg:border-y-0 lg:py-0">
                    {category.children && category.children.length > 0 ? (
                        <div className="flex flex-col items-start gap-3 w-full px-8">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                                {category.children.slice(0, 10).map((child: Category) => (
                                    <div key={child.id} className="flex items-center gap-2 group/item">
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: hexColor + '40' }} />
                                        <span className="text-[13px] font-bold text-slate-600 truncate transition-colors group-hover/item:text-slate-900">
                                            {child.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {category.children.length > 10 && (
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100 shrink-0" />
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        и ещё {category.children.length - 10}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-[13px] font-semibold text-slate-300 text-center italic w-full">
                            Нет подкатегорий
                        </div>
                    )}
                </div>

                {/* Column 3: Stats */}
                <div className="flex flex-col items-center justify-center flex-1 min-w-[240px] max-w-[400px]">
                    <div className="mb-4 flex flex-col items-center">
                        <span className="text-[48px] font-black text-slate-900 leading-[1.1] tabular-nums tracking-tight mb-1">
                            {(category.totalQuantity || 0).toLocaleString()}
                        </span>
                        <span
                            className="text-[13px] font-bold"
                            style={{ color: hexColor }}
                        >
                            единиц в наличии
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 mb-6 w-max">
                        <span className="text-[12px] font-bold text-slate-400 tracking-wide">На сумму:</span>
                        <span className="text-slate-800 font-extrabold tabular-nums text-[13px]">
                            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(category.totalCost || 0)}
                        </span>
                    </div>

                    <div className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 text-slate-900 transition-all font-extrabold text-[12px] cursor-pointer",
                        "group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-900/10"
                    )}>
                        <span>Перейти к категории</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
});

CategoryCardContent.displayName = "CategoryCardContent";
