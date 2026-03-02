"use client";

import React from "react";
import { GripVertical, Pencil, ChevronRight } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Category } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getCategoryCardStyles, getHexColor } from "@/app/(main)/dashboard/warehouse/category-utils";

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
                "group crm-card relative overflow-hidden rounded-[24px] sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center h-full sm:min-h-[320px] transition-all duration-500 hover:shadow-2xl cursor-pointer bg-white",
                "p-4 sm:p-0",
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
    const cardStyles = getCategoryCardStyles(color);
    const hexColor = getHexColor(color);
    const isOrphaned = category.id === "orphaned";

    return (
        <>
            {/* Content Layer - Explicitly on top */}
            <div className="relative z-10 w-full h-full sm:p-6 flex flex-col sm:items-center flex-1 justify-center">

                {!isOrphaned && (
                    <div role="button" tabIndex={0}
                        {...dragHandleProps}
                        aria-label="Перетащить для изменения порядка"
                        className={cn(
                            "absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-all rounded-lg hover:bg-slate-50 opacity-0 group-hover:opacity-100",
                            isDragging && "cursor-grabbing text-primary opacity-100"
                        )}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}

                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start w-full gap-3 sm:gap-0">
                    {/* Left Column (Mobile) / Top Row (Desktop) */}
                    <div className="flex flex-col items-start sm:items-center justify-center shrink-0 max-sm:w-[55%] max-sm:text-left">
                        {/* Category Icon */}
                        <div
                            className="w-14 h-14 sm:w-20 sm:h-20 rounded-[18px] sm:rounded-[32px] flex items-center justify-center text-white mb-3 sm:mb-4 transition-all duration-500 shrink-0"
                            style={cardStyles.icon}
                        >
                            <IconComponent className="w-6 h-6 sm:w-10 h-10 stroke-[1.5]" />
                        </div>

                        {/* Title & SKU Count */}
                        <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 mb-0.5 sm:mb-1 leading-tight text-balance">
                            {category.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mb-0 sm:mb-3 leading-tight">
                            {category.itemCount || 0} активных SKU<span className="hidden sm:inline"> на складе</span>
                        </p>

                        {/* Divider & Subcategories (Hidden on mobile) */}
                        <div className="hidden w-full sm:flex flex-col items-center gap-3 mb-0">
                            <div className="w-[120px] h-px bg-slate-100" />
                            {category.children && category.children.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-1.5 max-w-[240px]">
                                    {category.children.slice(0, 5).map((child: Category) => (
                                        <span key={child.id} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-xs font-bold text-slate-400">
                                            {child.name}
                                        </span>
                                    ))}
                                    {category.children.length > 5 && (
                                        <span className="text-xs font-bold text-slate-300">+{category.children.length - 5}</span>
                                    )}
                                </div>
                            ) : category.description ? (
                                <p className="text-xs font-medium text-slate-500 line-clamp-2 px-4">
                                    {category.description}
                                </p>
                            ) : (
                                <div className="h-4" /> // Spacing if no children and no description
                            )}
                        </div>
                    </div>

                    {/* Right Column (Mobile) / Main Quantity (Desktop) */}
                    <div className="flex flex-col items-center justify-center max-sm:flex-1 sm:mt-4 w-full shrink-0">
                        <span className="text-[34px] sm:text-5xl font-black text-slate-900 tabular-nums leading-none">
                            {(category.totalQuantity || 0).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-xs font-bold mt-1 sm:mt-2 mb-2 sm:mb-2 max-sm:mb-3 text-center sm:text-center w-full" style={{ color: hexColor }}>
                            единиц в наличии
                        </span>
                        <div className="flex max-sm:flex-col items-center max-sm:justify-center gap-0.5 sm:gap-1.5 px-3 sm:px-3 py-1.5 sm:py-1 max-sm:w-full rounded-[14px] sm:rounded-full bg-slate-50 border border-slate-100 mt-0 sm:mt-0">
                            <span className="text-xs font-bold text-slate-400">На сумму:</span>
                            <span className="text-slate-700 font-extrabold tabular-nums text-xs sm:text-sm leading-none">
                                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(category.totalCost || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Button (Absolute) */}
                {!isOrphaned && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="absolute top-2 right-2 sm:top-2 sm:right-2 w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Call to Action: ПЕРЕЙТИ Button */}
                <div className="hidden sm:flex mt-auto pt-4 items-center justify-center w-full">
                    <div className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-100/50 text-slate-900 transition-all",
                        "group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-900/10"
                    )}>
                        <span className="text-[11px] font-black tracking-normal">Перейти</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </>
    );
});

CategoryCardContent.displayName = "CategoryCardContent";
