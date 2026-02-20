"use client";

import React, { createElement } from "react";
import { GripVertical, Edit, Trash2, ChevronRight } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Category } from "../../types";
import { getCategoryIcon, getColorStyles } from "../../category-utils";

interface NavigationRouter {
    push: (href: string) => void;
}

interface SubCategoryCardProps {
    subcat: Category;
    router: NavigationRouter;
    setEditingCategory: (cat: Category) => void;
    setDeletingCategory: (cat: Category) => void;
}

export const SortableSubCategoryCard = React.memo(({
    subcat,
    router,
    setEditingCategory,
    setDeletingCategory
}: SubCategoryCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subcat.id });

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
            onClick={() => router.push(`/dashboard/warehouse/${subcat.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/dashboard/warehouse/${subcat.id}`);
                }
            }}
            className={cn(
                "group crm-card p-6 cursor-pointer flex items-center justify-between relative overflow-hidden transition-all duration-500 shadow-sm !rounded-2xl sm:!rounded-[var(--radius)]",
                isDragging && "opacity-0 scale-95"
            )}
        >
            <SubCategoryCardContent
                subcat={subcat}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
                onEdit={() => setEditingCategory(subcat)}
                onDelete={() => setDeletingCategory(subcat)}
            />
        </div>
    );
});

SortableSubCategoryCard.displayName = "SortableSubCategoryCard";

interface SubCategoryCardContentProps {
    subcat: Category;
    isDragging?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const SubCategoryCardContent = React.memo(({
    subcat,
    isDragging,
    dragHandleProps,
    onEdit,
    onDelete,
}: SubCategoryCardContentProps) => {
    const IconComponent = getCategoryIcon(subcat);
    const colorStyle = getColorStyles(subcat.color);

    return (
        <>
            <div className="flex items-center gap-3 flex-1 relative z-10">
                <div role="button" tabIndex={0}
                    {...dragHandleProps}
                    aria-label="Перетащить для изменения порядка"
                    className={cn(
                        "w-8 h-10 -ml-2 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-lg hover:bg-slate-50",
                        isDragging && "cursor-grabbing text-primary"
                    )}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    colorStyle
                )}>
                    {createElement(IconComponent, { className: "w-5 h-5" })}
                </div>
                <div>
                    <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {subcat.name}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                        {subcat.totalQuantity || 0} шт.
                    </span>
                </div>
            </div>

            <div className={cn(
                "flex items-center gap-0.5 transition-all relative z-10",
                isDragging && "opacity-0"
            )}>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all p-0"
                    title="Редактировать"
                >
                    <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all p-0"
                    title="Удалить"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary ml-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </>
    );
});

SubCategoryCardContent.displayName = "SubCategoryCardContent";
