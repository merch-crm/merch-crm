"use client";

import React, { useState, useRef, useEffect } from "react";
import { GripVertical, Pencil, ChevronRight } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Category } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getHexColor } from "@/app/(main)/dashboard/warehouse/category-utils";
import { pluralize } from "@/lib/pluralize";

interface NavigationRouter {
    push: (href: string) => void;
}

interface CategoryWithChildren extends Category {
    children?: Category[];
}

interface CategoryCardProps {
    category: CategoryWithChildren;
    router: NavigationRouter;
    setEditingCategory: (cat: Category) => void;
    isAnyDragging?: boolean;
    onLayoutChange?: (id: string, isWide: boolean, isExtraWide: boolean) => void;
}

export const SortableCategoryCard = React.memo(({
    category,
    router,
    setEditingCategory,
    isAnyDragging,
    onLayoutChange,
}: CategoryCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isWide, setIsWide] = useState(false);
    const [isExtraWide, setIsExtraWide] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    // Internal refs to track layout without triggering re-renders in observer
    const lastWideRef = useRef(false);
    const lastExtraWideRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Refs to avoid stale closures inside ResizeObserver and setTimeout callbacks
    const isAnyDraggingRef = useRef(isAnyDragging);
    const isDraggingRef = useRef(isDragging);
    useEffect(() => { isAnyDraggingRef.current = isAnyDragging; }, [isAnyDragging]);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);

    // postDragFreezeRef: keeps the ResizeObserver paused for 300ms after drag ends
    // This prevents the observer from firing mid-animation and giving wrong readings
    const postDragFreezeRef = useRef(false);
    const postDragTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isDragging && !isAnyDragging) {
            // Freeze observer until drop animation completes (200ms) + buffer = 300ms
            postDragFreezeRef.current = true;
            if (postDragTimerRef.current) clearTimeout(postDragTimerRef.current);

            postDragTimerRef.current = setTimeout(() => {
                postDragFreezeRef.current = false;
                if (!cardRef.current) return;

                // Single authoritative recheck after DOM has fully settled
                const width = cardRef.current.getBoundingClientRect().width;
                const wideThreshold = 380;
                const extraWideThreshold = 930;
                const nextWide = width > wideThreshold + 10;
                const nextExtraWide = width > extraWideThreshold + 10;

                lastWideRef.current = nextWide;
                lastExtraWideRef.current = nextExtraWide;
                setIsWide(nextWide);
                setIsExtraWide(nextExtraWide);
                onLayoutChange?.(category.id, nextWide, nextExtraWide);
            }, 300);
        }
        return () => {
            if (postDragTimerRef.current) clearTimeout(postDragTimerRef.current);
        };
    }, [isDragging, isAnyDragging, category.id, onLayoutChange]);

    useEffect(() => {
        if (!cardRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            // Use refs to avoid stale closure — isAnyDragging/isDragging may be stale otherwise
            if (isDraggingRef.current || postDragFreezeRef.current) return;

            const width = entry.contentRect.width;

            // Hysteresis buffers (10px) to prevent flickering at edges
            const wideThreshold = 380;
            const extraWideThreshold = 930;
            const buffer = 10;

            let nextWide = lastWideRef.current;
            if (!nextWide && width > wideThreshold + buffer) nextWide = true;
            else if (nextWide && width < wideThreshold - buffer) nextWide = false;

            let nextExtraWide = lastExtraWideRef.current;
            if (!nextExtraWide && width > extraWideThreshold + buffer) nextExtraWide = true;
            else if (nextExtraWide && width < extraWideThreshold - buffer) nextExtraWide = false;

            if (nextWide !== lastWideRef.current || nextExtraWide !== lastExtraWideRef.current) {
                // Debounce the state update to allow layout to settle
                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                timeoutRef.current = setTimeout(() => {
                    lastWideRef.current = nextWide;
                    lastExtraWideRef.current = nextExtraWide;
                    setIsWide(nextWide);
                    setIsExtraWide(nextExtraWide);
                    onLayoutChange?.(category.id, nextWide, nextExtraWide);
                }, 50); // 50ms debounce
            }
        });

        observer.observe(cardRef.current);
        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isDragging, category.id, onLayoutChange]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Completely hide during drag for miniature stability
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                cardRef.current = node;
            }}
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
            className={cn("group relative bg-white border border-slate-200/60 rounded-[28px] sm:rounded-[32px] overflow-hidden transition-shadow duration-300", "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-slate-300/80",
                isDragging ? "shadow-2xl ring-2 ring-primary/20 border-primary/30" : "shadow-sm", "h-full flex flex-col"
            )}
        >
            <CategoryCardContent
                category={category}
                isDragging={isDragging}
                isWide={isWide}
                isExtraWide={isExtraWide}
                dragHandleProps={{ ...attributes, ...listeners }}
                onEdit={() => setEditingCategory(category)}
            />
        </div>
    );
});

SortableCategoryCard.displayName = "SortableCategoryCard";

interface CategoryCardContentProps {
    category: CategoryWithChildren;
    isDragging?: boolean;
    isWide?: boolean;
    isExtraWide?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onEdit?: () => void;
}

export const CategoryCardContent = React.memo(({
    category,
    isDragging,
    isWide,
    isExtraWide,
    dragHandleProps,
    onEdit,
}: CategoryCardContentProps) => {
    const IconComponent = getCategoryIcon(category);
    const color = category.color || "slate";
    const hexColor = getHexColor(color);
    const isOrphaned = category.id === "orphaned";

    return (
        <div className={cn("relative flex flex-col items-center w-full h-full min-h-[220px]", // Stabilize height
            !isDragging && "pt-4 sm:pt-5"
        )}>

            {/* Drag Handle & Edit */}
            <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-6 z-30">
                {!isOrphaned && (
                    <div role="button" tabIndex={0}
                        {...dragHandleProps}
                        aria-label="Перетащить для изменения порядка"
                        className={cn("w-8 h-8 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-all rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
                            isDragging && "cursor-grabbing text-primary opacity-100"
                        )}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                )}
                {!isOrphaned && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="w-8 h-8 rounded-full text-slate-300 hover:text-slate-900 flex items-center justify-center transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Main content area */}
            <div className="relative z-10 w-full h-full p-4 sm:p-5 flex flex-col justify-center">
                <div className={cn("flex flex-wrap items-stretch justify-center w-full h-full gap-y-3",
                    isWide && "flex-nowrap items-center justify-center gap-x-3 sm:gap-x-3 px-4 sm:px-8",
                    isExtraWide && "items-center gap-x-3 px-6"
                )}>

                    {/* Column 1: Identity */}
                    <div className={cn("flex flex-col items-center justify-center min-w-0 max-w-full",
                        isWide ? "flex-[1] basis-0" : "w-full max-w-[280px]",
                        isExtraWide && "flex-[0.8] basis-auto"
                    )}>
                        <div
                            className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-white mb-2 transition-transform"
                            style={{ backgroundColor: hexColor }}
                        >
                            <IconComponent className="w-8 h-8 stroke-[1.5]" />
                        </div>
                        <h3 className="text-[20px] font-black text-slate-900 leading-tight mb-1 text-center">
                            {category.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-400 text-center">
                            {category.itemCount || 0} {pluralize(category.itemCount || 0, "активный SKU", "активных SKU", "активных SKU")} на складе
                        </p>
                    </div>

                    {/* Column 2: Subcategories */}
                    <div className={cn("flex flex-col items-center justify-center min-w-0 border-y lg:border-y-0 border-slate-100/80 py-4 my-auto lg:py-0",
                        isWide ? "flex-[1] basis-0 px-2 w-full" : "max-w-[600px] w-full",
                        isExtraWide && "flex-[2.5] basis-auto"
                    )}>
                        {category.children && category.children.length > 0 ? (
                            <div className="w-full xl:px-2 max-w-[320px]">
                                <div className={cn("grid gap-2 w-full",
                                    isExtraWide ? "grid-cols-5" : (isWide ? "grid-cols-1" : "grid-cols-3")
                                )}>
                                    {(() => {
                                        let maxSlots = 6;
                                        if (isExtraWide) maxSlots = 15;
                                        else if (isWide) maxSlots = 4;

                                        const hasOverflow = category.children.length > maxSlots;
                                        const visibleItems = hasOverflow
                                            ? category.children.slice(0, maxSlots - 1)
                                            : category.children.slice(0, maxSlots);

                                        return (
                                            <>
                                                {visibleItems.map((child: Category) => (
                                                    <div
                                                        key={child.id}
                                                        className="px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 truncate shadow-sm transition-all hover:bg-white hover:border-slate-200 hover:shadow-md cursor-default text-center"
                                                    >
                                                        {child.name}
                                                    </div>
                                                ))}
                                                {hasOverflow && (
                                                    <div className="flex items-center justify-center px-2 py-1.5 bg-slate-100/50 border border-dashed border-slate-200 rounded-xl">
                                                        <span className="text-xs font-black text-slate-400 whitespace-nowrap">
                                                            Ещё +{category.children.length - (maxSlots - 1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className={cn("flex flex-col items-center justify-center w-full min-h-[80px] space-y-2 opacity-[0.25] transition-all",
                                isExtraWide ? "scale-100" : "scale-90"
                            )}>
                                <div className="flex items-center gap-3 w-full max-w-[180px]">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
                                </div>
                                <div className="text-[12px] font-bold text-slate-400 text-center tracking-tight px-4 line-clamp-2">
                                    {category.description || "Нет подкатегорий"}
                                </div>
                                <div className="flex items-center gap-3 w-full max-w-[180px]">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 3: Stats */}
                    <div className={cn("flex flex-col items-center justify-between min-w-0 py-1",
                        isWide ? "flex-[1] basis-0" : "w-full max-w-[280px]",
                        isExtraWide && "flex-[0.8] basis-auto"
                    )}>
                        <div className="flex flex-col items-center w-full">
                            <div className="mb-1 flex flex-col items-center">
                                <span className="text-[44px] font-black text-slate-900 leading-[1.1] tabular-nums tracking-tight">
                                    {(category.totalQuantity || 0).toLocaleString()}
                                </span>
                                <span className="text-[12px] font-bold" style={{ color: hexColor }}>
                                    {pluralize(category.totalQuantity || 0, "единица", "единицы", "единиц")} в наличии
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 w-max mb-4">
                                <span className="text-[11px] font-bold text-slate-400 tracking-wide">На сумму:</span>
                                <span className="text-slate-800 font-extrabold tabular-nums text-[12px]">
                                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(category.totalCost || 0)}
                                </span>
                            </div>
                        </div>
                        <div className={cn("flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 text-slate-900 transition-all font-extrabold text-[12px] cursor-pointer whitespace-nowrap", "group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-900/10"
                        )}>
                            <span>Перейти к категории</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CategoryCardContent.displayName = "CategoryCardContent";

/* ── Full-scale drag preview (rendered inside DragOverlay) ── */
interface DragPreviewProps {
    category: CategoryWithChildren;
}

export const DragPreview = React.memo(({ category }: DragPreviewProps) => {
    // We assume a standard width for the preview since it's floating
    // 400px is wide enough to show the wide layout on most monitors
    return (
        <div className="w-[420px] shadow-2xl rounded-[32px] pointer-events-none select-none overflow-hidden border border-primary/20 bg-white/80 backdrop-blur-sm">
            <CategoryCardContent
                category={category}
                isDragging={false}
                isWide={true}
                isExtraWide={false}
                onEdit={() => { }}
            />
        </div>
    );
});

DragPreview.displayName = "DragPreview";
