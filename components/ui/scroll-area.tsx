"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { useScrollFade, useHorizontalScroll, useAutoScroll } from "@/components/hooks/useScrollArea";

// Базовый ScrollArea
const ScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
        orientation?: "vertical" | "horizontal" | "both";
    }
>(({ className, children, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>
        {(orientation === "vertical" || orientation === "both") && (
            <ScrollBar orientation="vertical" />
        )}
        {(orientation === "horizontal" || orientation === "both") && (
            <ScrollBar orientation="horizontal" />
        )}
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// Скроллбар
interface ScrollBarProps
    extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
    variant?: "default" | "thin" | "hidden";
}

const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    ScrollBarProps
>(({ className, orientation = "vertical", variant = "default", ...props }, ref) => {
    const sizeClasses = {
        default: orientation === "vertical" ? "w-2.5" : "h-2.5",
        thin: orientation === "vertical" ? "w-1.5" : "h-1.5",
        hidden: "opacity-0",
    };

    const thumbSizeClasses = {
        default: "",
        thin: orientation === "vertical" ? "w-1" : "h-1",
        hidden: "",
    };

    return (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
            ref={ref}
            orientation={orientation}
            className={cn(
                "flex touch-none select-none transition-colors",
                orientation === "vertical" && "h-full border-l border-l-transparent p-[1px]",
                orientation === "horizontal" && "flex-col w-full border-t border-t-transparent p-[1px]",
                sizeClasses[variant],
                className
            )}
            {...props}
        >
            <ScrollAreaPrimitive.ScrollAreaThumb
                className={cn(
                    "relative flex-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors",
                    thumbSizeClasses[variant]
                )}
            />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
    );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// ScrollArea с фиксированной высотой
interface ScrollAreaFixedProps {
    children: React.ReactNode;
    height?: number | string;
    maxHeight?: number | string;
    className?: string;
    orientation?: "vertical" | "horizontal" | "both";
    variant?: "default" | "thin" | "hidden";
}

function ScrollAreaFixed({
    children,
    height,
    maxHeight,
    className,
    orientation = "vertical",
    variant = "default",
}: ScrollAreaFixedProps) {
    const style: React.CSSProperties = {};
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    if (maxHeight) style.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    return (
        <ScrollAreaPrimitive.Root
            className={cn("relative overflow-hidden", className)}
            style={style}
        >
            <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
                {children}
            </ScrollAreaPrimitive.Viewport>
            {(orientation === "vertical" || orientation === "both") && (
                <ScrollBar orientation="vertical" variant={variant} />
            )}
            {(orientation === "horizontal" || orientation === "both") && (
                <ScrollBar orientation="horizontal" variant={variant} />
            )}
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    );
}

// ScrollArea с градиентными тенями (показывают что есть ещё контент)
interface ScrollAreaFadedProps extends ScrollAreaFixedProps {
    fadeSize?: number;
    fadeColor?: string;
}

function ScrollAreaFaded({
    children,
    height,
    maxHeight,
    className,
    orientation = "vertical",
    variant = "default",
    fadeSize = 24,
    fadeColor = "255, 255, 255",
}: ScrollAreaFadedProps) {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const { showTopFade, showBottomFade, showLeftFade, showRightFade, checkScroll } = useScrollFade(orientation, viewportRef);

    const style: React.CSSProperties = {};
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    if (maxHeight) style.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    return (
        <div className={cn("relative", className)} style={style}>
            <ScrollAreaPrimitive.Root className="h-full w-full overflow-hidden">
                <ScrollAreaPrimitive.Viewport
                    ref={viewportRef}
                    className="h-full w-full rounded-[inherit] px-1" // px-1 чтобы избежать скачков
                    onScroll={checkScroll} // Нужно повесить слушатель прямо сюда для ScrollAreaPrimitive? ScrollAreaPrimitive.Viewport рендерит div, но лучше использовать ref и useEffect как выше. Но Radix Viewport не прокидывает onScroll? А, прокидывает props.
                >
                    {children}
                </ScrollAreaPrimitive.Viewport>
                {(orientation === "vertical" || orientation === "both") && (
                    <ScrollBar orientation="vertical" variant={variant} />
                )}
                {(orientation === "horizontal" || orientation === "both") && (
                    <ScrollBar orientation="horizontal" variant={variant} />
                )}
                <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>

            {/* Градиентные тени */}
            {(orientation === "vertical" || orientation === "both") && (
                <>
                    <div
                        className={cn(
                            "absolute top-0 left-0 right-0 pointer-events-none transition-opacity duration-200 z-10",
                            showTopFade ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            height: fadeSize,
                            background: `linear-gradient(to bottom, rgba(${fadeColor}, 1), rgba(${fadeColor}, 0))`,
                        }}
                    />
                    <div
                        className={cn(
                            "absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-200 z-10",
                            showBottomFade ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            height: fadeSize,
                            background: `linear-gradient(to top, rgba(${fadeColor}, 1), rgba(${fadeColor}, 0))`,
                        }}
                    />
                </>
            )}

            {(orientation === "horizontal" || orientation === "both") && (
                <>
                    <div
                        className={cn(
                            "absolute top-0 left-0 bottom-0 pointer-events-none transition-opacity duration-200 z-10",
                            showLeftFade ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            width: fadeSize,
                            background: `linear-gradient(to right, rgba(${fadeColor}, 1), rgba(${fadeColor}, 0))`,
                        }}
                    />
                    <div
                        className={cn(
                            "absolute top-0 right-0 bottom-0 pointer-events-none transition-opacity duration-200 z-10",
                            showRightFade ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            width: fadeSize,
                            background: `linear-gradient(to left, rgba(${fadeColor}, 1), rgba(${fadeColor}, 0))`,
                        }}
                    />
                </>
            )}
        </div>
    );
}

// Горизонтальный скролл для списка элементов
interface ScrollAreaHorizontalListProps {
    children: React.ReactNode;
    className?: string;
    gap?: "sm" | "md" | "lg";
    showArrows?: boolean;
    variant?: "default" | "thin" | "hidden";
}

function ScrollAreaHorizontalList({
    children,
    className,
    gap = "md",
    showArrows = false,
    variant = "hidden",
}: ScrollAreaHorizontalListProps) {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const { canScrollLeft, canScrollRight, scroll } = useHorizontalScroll(viewportRef);

    const gapClasses = {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-3",
    };

    return (
        <div className={cn("relative group", className)}>
            <ScrollAreaPrimitive.Root className="overflow-hidden">
                <ScrollAreaPrimitive.Viewport
                    ref={viewportRef}
                    className="h-full w-full"
                >
                    <div className={cn("flex", gapClasses[gap])}>{children}</div>
                </ScrollAreaPrimitive.Viewport>
                <ScrollBar orientation="horizontal" variant={variant} />
            </ScrollAreaPrimitive.Root>

            {/* Стрелки навигации */}
            {showArrows && (
                <>
                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center transition-all z-20",
                            "hover:bg-slate-50 active:scale-95",
                            canScrollLeft
                                ? "opacity-100 -translate-x-1/2"
                                : "opacity-0 pointer-events-none -translate-x-full"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll("right")}
                        className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center transition-all z-20",
                            "hover:bg-slate-50 active:scale-95",
                            canScrollRight
                                ? "opacity-100 translate-x-1/2"
                                : "opacity-0 pointer-events-none translate-x-full"
                        )}
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                </>
            )}

            {/* Градиенты по краям */}
            <div
                className={cn(
                    "absolute top-0 left-0 bottom-0 w-8 pointer-events-none transition-opacity bg-gradient-to-r from-white to-transparent z-10",
                    canScrollLeft ? "opacity-100" : "opacity-0"
                )}
            />
            <div
                className={cn(
                    "absolute top-0 right-0 bottom-0 w-8 pointer-events-none transition-opacity bg-gradient-to-l from-white to-transparent z-10",
                    canScrollRight ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    );
}

// Скролл для таблиц
interface ScrollAreaTableProps {
    children: React.ReactNode;
    maxHeight?: number | string;
    className?: string;
}

function ScrollAreaTable({ children, maxHeight, className }: ScrollAreaTableProps) {
    const style: React.CSSProperties = {};
    if (maxHeight) style.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    return (
        <div className={cn("relative rounded-2xl border border-slate-200 overflow-hidden", className)}>
            <ScrollAreaPrimitive.Root className="overflow-hidden h-full" style={style}>
                <ScrollAreaPrimitive.Viewport className="h-full w-full">
                    {children}
                </ScrollAreaPrimitive.Viewport>
                <ScrollBar orientation="vertical" />
                <ScrollBar orientation="horizontal" />
                <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>
        </div>
    );
}

// Скролл для модальных окон / сайдбаров
interface ScrollAreaModalProps {
    children: React.ReactNode;
    className?: string;
}

function ScrollAreaModal({ children, className }: ScrollAreaModalProps) {
    return (
        <ScrollAreaPrimitive.Root className={cn("h-full overflow-hidden", className)}>
            <ScrollAreaPrimitive.Viewport className="h-full w-full">
                {children}
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar orientation="vertical" variant="thin" />
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    );
}

// Автоскролл к низу (для чатов, логов)
interface ScrollAreaAutoScrollProps {
    children: React.ReactNode;
    height?: number | string;
    maxHeight?: number | string;
    className?: string;
    autoScroll?: boolean;
}

function ScrollAreaAutoScroll({
    children,
    height,
    maxHeight,
    className,
    autoScroll = true,
}: ScrollAreaAutoScrollProps) {
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const { showButton, scrollToBottom } = useAutoScroll(viewportRef, autoScroll, children);

    const style: React.CSSProperties = {};
    if (height) style.height = typeof height === "number" ? `${height}px` : height;
    if (maxHeight) style.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

    return (
        <div className={cn("relative", className)} style={style}>
            <ScrollAreaPrimitive.Root className="h-full overflow-hidden">
                <ScrollAreaPrimitive.Viewport
                    ref={viewportRef}
                    className="h-full w-full"
                >
                    {children}
                </ScrollAreaPrimitive.Viewport>
                <ScrollBar orientation="vertical" variant="thin" />
                <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>

            {/* Кнопка скролла вниз */}
            {showButton && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-2 z-20"
                >
                    <ArrowDown className="w-4 h-4 text-slate-600" />
                </button>
            )}
        </div>
    );
}

export {
    ScrollArea,
    ScrollBar,
    ScrollAreaFixed,
    ScrollAreaFaded,
    ScrollAreaHorizontalList,
    ScrollAreaTable,
    ScrollAreaModal,
    ScrollAreaAutoScroll,
};
