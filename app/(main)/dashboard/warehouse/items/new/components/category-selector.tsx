"use client";

import { createElement, useEffect, useRef } from "react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryCardStyles, getHexColor } from "@/app/(main)/dashboard/warehouse/category-utils";
import { pluralize } from "@/lib/pluralize";
import { Category } from "@/app/(main)/dashboard/warehouse/types";

interface CategorySelectorProps {
    categories: Category[];
    onSelect: (category: Category) => void;
    variant?: "default" | "compact";
    hideTitle?: boolean;
    selectedCategoryId?: string;
    isCompact?: boolean;
    rightElement?: React.ReactNode;
}

export function CategorySelector({
    categories,
    onSelect,
    variant = "default",
    hideTitle = false,
    selectedCategoryId,
    isCompact = false,
    rightElement
}: CategorySelectorProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Drag + momentum scroll
    const isDragging = useRef(false);
    const hasDragged = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const velocity = useRef(0);
    const lastX = useRef(0);
    const rafId = useRef<number | null>(null);

    const stopMomentum = () => {
        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
    };

    const applyMomentum = (el: HTMLDivElement) => {
        const friction = 0.92;
        velocity.current *= friction;
        if (Math.abs(velocity.current) < 0.5) {
            stopMomentum();
            return;
        }
        el.scrollLeft -= velocity.current;
        rafId.current = requestAnimationFrame(() => applyMomentum(el));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        stopMomentum();
        isDragging.current = true;
        hasDragged.current = false;
        scrollContainerRef.current.classList.add("cursor-grabbing");
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        lastX.current = e.pageX;
        scrollLeft.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.scrollSnapType = 'none';
        scrollContainerRef.current.style.scrollBehavior = 'auto';
    };

    const handleMouseUp = () => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        isDragging.current = false;
        scrollContainerRef.current.classList.remove("cursor-grabbing");
        const el = scrollContainerRef.current;
        applyMomentum(el);
        setTimeout(() => {
            if (el) {
                el.style.scrollSnapType = '';
                el.style.scrollBehavior = '';
            }
        }, 600);
    };

    const handleMouseLeave = () => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        handleMouseUp();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.2;
        velocity.current = e.pageX - lastX.current;
        lastX.current = e.pageX;
        if (Math.abs(walk) > 5) hasDragged.current = true;
        scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
    };

    // Scroll selected into view (PC horizontal scroll) — only when not already visible
    useEffect(() => {
        if (!selectedCategoryId || !scrollContainerRef.current) return;
        const timer = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const element = container.querySelector<HTMLElement>(`[data-category-id="${selectedCategoryId}"]`);
            if (!element) return;

            // getBoundingClientRect gives viewport-relative coords — consistent regardless of DOM nesting
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const isFullyVisible =
                elementRect.left >= containerRect.left &&
                elementRect.right <= containerRect.right;

            // Only scroll if the element isn't already visible
            if (!isFullyVisible) {
                const scrollTarget = container.scrollLeft + (elementRect.left - containerRect.left);
                container.scrollTo({ left: scrollTarget, behavior: "smooth" });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [selectedCategoryId, variant]);

    // Block browser back/forward swipe on horizontal scroll
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            if (!isHorizontal) return;
            const atStart = el.scrollLeft <= 0 && e.deltaX < 0;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaX > 0;
            if (atStart || atEnd) e.preventDefault();
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [variant]);

    // Determine adaptive grid for mobile/tablet
    const count = categories.length;
    const mobileCols = count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 2 : 3;
    const mobileRows = Math.ceil(count / mobileCols);

    return (
        <div className="w-full h-full xl:h-full flex flex-col min-h-0 !overflow-visible">
            {/* Title */}
            {!hideTitle && (
                <div className="flex items-start justify-between gap-3 shrink-0 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Выберите категорию</h2>
                            <p className="text-xs font-bold text-slate-700 opacity-60">От категории зависят доступные поля и характеристики</p>
                        </div>
                    </div>
                    {rightElement}
                </div>
            )}

            {/* Cards container */}
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={cn("w-full min-w-0 min-h-0 transition-all py-2 -my-2 pl-1 pr-1",
                    "xl:flex xl:h-full xl:flex-row xl:items-start xl:overflow-x-auto xl:snap-x xl:snap-mandatory xl:hide-scrollbar xl:gap-3 xl:overscroll-x-none xl:touch-pan-x xl:pb-8", // Clean horizontal scroll
                    "grid gap-2 sm:gap-3 flex-1 h-full pb-8"
                )}
                style={{
                    // Mobile/tablet: adaptive grid
                    gridTemplateColumns: `repeat(${mobileCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${mobileRows}, minmax(0, 1fr))`
                }}
            >

                {categories.map((category: Category) => {
                    const IconComponent = getCategoryIcon(category);
                    const cardStyles = getCategoryCardStyles(category.color);
                    const isSelected = selectedCategoryId === category.id;

                    if (variant === "compact") {
                        // Desktop: horizontal scroll with compact SQUARE tiles
                        return (
                            <button
                                type="button"
                                key={category.id}
                                data-category-id={category.id}
                                onClick={(e) => {
                                    if (hasDragged.current) {
                                        e.preventDefault();
                                        hasDragged.current = false;
                                        return;
                                    }
                                    onSelect(category);
                                }}
                                className={cn("group flex flex-col items-center justify-center gap-2 border transition-all text-center duration-200 outline-none cursor-pointer overflow-hidden relative",
                                    "xl:h-auto xl:w-[90px] xl:shrink-0 xl:aspect-square xl:snap-start xl:p-2", // Desktop: fixed square
                                    "h-full p-2 sm:p-3", "rounded-[16px] sm:rounded-[18px]", // Mobile: fills grid cell
                                    isSelected
                                        ? "border-slate-900 bg-slate-50 shadow-md"
                                        : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                )}
                            >
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                                    style={isSelected ? cardStyles.icon : {
                                        background: `${getHexColor(category.color)}22`,
                                        boxShadow: "none",
                                    }}
                                >
                                    <span style={{ color: isSelected ? "#fff" : getHexColor(category.color) }}>
                                        {createElement(IconComponent, { className: "w-4 h-4" })}
                                    </span>
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 leading-tight text-center w-full break-words">
                                    {category.name}
                                </h3>
                            </button>
                        );
                    }

                    // Default variant: full cards with stats (top-level categories)
                    const iconSize = isCompact
                        ? "w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] xl:w-[60px] xl:h-[60px]"
                        : (mobileRows >= 3 ? "w-[44px] h-[44px] sm:w-[72px] sm:h-[72px] xl:w-[60px] xl:h-[60px]" : "w-[56px] h-[56px] sm:w-[80px] sm:h-[80px] xl:w-[60px] xl:h-[60px]");
                    const iconInnerSize = isCompact
                        ? "w-3 h-3 sm:w-4 sm:h-4 xl:w-6 xl:h-6"
                        : (mobileRows >= 3 ? "w-4 h-4 sm:w-7 sm:h-7 xl:w-6 xl:h-6" : "w-5 h-5 sm:w-8 sm:h-8 xl:w-6 xl:h-6");

                    return (
                        <button
                            type="button"
                            key={category.id}
                            data-category-id={category.id}
                            onClick={(e) => {
                                if (hasDragged.current) {
                                    e.preventDefault();
                                    hasDragged.current = false;
                                    return;
                                }
                                onSelect(category);
                            }}
                            className={cn("group flex flex-col items-center justify-center gap-1 transition-all text-center h-full duration-200 outline-none cursor-pointer overflow-hidden border relative",
                                "xl:snap-start xl:shrink-0 xl:w-[calc(25%-12px)] xl:min-w-[190px] xl:max-w-[240px]", // Desktop snap
                                // Padding & radius
                                isCompact ? "p-1.5 sm:p-3 rounded-[18px] sm:rounded-[24px]" : "p-2 sm:p-6 rounded-[24px]",
                                isSelected
                                    ? "border-slate-900 bg-slate-50 shadow-md ring-4 ring-slate-900/5"
                                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow-md"
                            )}
                        >
                            {/* Icon circle */}
                            <div className={cn("relative rounded-full flex items-center justify-center shrink-0 mb-0.5 sm:mb-1", iconSize)}>
                                <div
                                    className="absolute inset-0 rounded-full transition-opacity duration-500"
                                    style={{ background: getHexColor(category.color), opacity: isSelected ? 0 : 1 }}
                                />
                                <div
                                    className="absolute inset-0 rounded-full transition-opacity duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, ${getHexColor(category.color)} 0%, ${getHexColor(category.color)}cc 100%)`,
                                        opacity: isSelected ? 1 : 0
                                    }}
                                />
                                <div
                                    className="relative z-10 transition-colors duration-500 text-white"
                                >
                                    {createElement(IconComponent, { className: iconInnerSize, strokeWidth: 1.5 })}
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="flex flex-col items-center w-full min-h-0">
                                <h3 className={cn("font-bold text-slate-900 break-words leading-tight tracking-tight mt-0.5 sm:mt-0",
                                    isCompact ? "text-xs sm:text-sm mb-0" : "text-xs sm:text-lg mb-0 sm:mb-0.5"
                                )}>
                                    {category.name}
                                </h3>

                                {/* Stats — desktop/PC: Visible only when not compact */}
                                {!isCompact && (
                                    <div className="hidden xl:flex flex-col items-center w-full">
                                        <p className="text-xs text-slate-400 font-bold mt-1 mb-3">
                                            0 {pluralize(0, "активный SKU", "активных SKU", "активных SKU")}
                                        </p>
                                        <div className="w-full h-px bg-slate-100 mb-2" />
                                        <div className="text-[32px] sm:text-[40px] font-black text-slate-900 leading-none tracking-tighter mb-0.5 sm:mb-1 mt-3">
                                            0
                                        </div>
                                        <div className="text-xs font-bold mb-1 text-slate-500">
                                            {pluralize(0, "единица", "единицы", "единиц")}
                                        </div>
                                    </div>
                                )}

                                {/* Compact desktop stat — just the number, visible only when isCompact */}
                                {isCompact && (
                                    <div className="hidden xl:flex flex-col items-center mt-1">
                                        <div className="text-lg font-black text-slate-900 leading-none">0</div>
                                        <div className="text-xs font-bold text-slate-400">{pluralize(0, "единица", "единицы", "единиц")}</div>
                                    </div>
                                )}

                                {/* Stats — mobile only: instant hide when compact */}
                                <div className={cn("xl:hidden flex flex-col items-center w-full", isCompact ? "hidden" : "block")}>
                                    <div className="text-sm font-black text-slate-900 leading-none tracking-tighter mt-1">
                                        0
                                    </div>
                                    <div className="text-[8px] font-bold text-slate-400 mt-0.5">
                                        ед.
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
                {/* Right edge spacer to prevent clipping */}
                <div className="hidden xl:block xl:w-10 xl:shrink-0" aria-hidden="true" />
            </div>
        </div>
    );
}
