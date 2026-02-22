"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Простой Tooltip (всё в одном)
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    delayDuration?: number;
    className?: string;
}

function Tooltip({
    content,
    children,
    side = "top",
    align = "center",
    delayDuration = 200,
    className,
}: TooltipProps) {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipRoot>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align} className={className}>
                    {content}
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

// Tooltip с заголовком и описанием
interface TooltipRichProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    delayDuration?: number;
}

function TooltipRich({
    title,
    description,
    children,
    side = "top",
    align = "center",
    delayDuration = 200,
}: TooltipRichProps) {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipRoot>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="max-w-[280px] px-4 py-3 flex flex-col gap-1"
                >
                    <p className="font-bold text-sm text-white">{title}</p>
                    {description && (
                        <p className="text-slate-300 font-normal leading-relaxed">{description}</p>
                    )}
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

// Tooltip со списком (для горячих клавиш и т.д.)
interface TooltipListItem {
    label: string;
    value?: string;
}

interface TooltipListProps {
    title?: string;
    items: TooltipListItem[];
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    delayDuration?: number;
}

function TooltipList({
    title,
    items = [],
    children,
    side = "top",
    align = "center",
    delayDuration = 200,
}: TooltipListProps) {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <TooltipRoot>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="px-3 py-2.5 min-w-[180px]"
                >
                    {title && (
                        <p className="font-bold text-sm mb-2 pb-2 border-b border-slate-700">{title}</p>
                    )}
                    <div className="space-y-1">
                        {(items || []).map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-3">
                                <span className="text-slate-300">{item.label}</span>
                                {item.value && (
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono text-white">
                                        {item.value}
                                    </kbd>
                                )}
                            </div>
                        ))}
                    </div>
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

// Иконка с подсказкой (часто используется для информации)
interface TooltipIconProps {
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
    iconClassName?: string;
}

function TooltipIcon({ content, side = "top", className, iconClassName }: TooltipIconProps) {
    return (
        <Tooltip content={content} side={side}>
            <button
                type="button"
                className={cn(
                    "inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors cursor-help",
                    className
                )}
            >
                <svg
                    className={cn("w-3 h-3 text-slate-600", iconClassName)}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </button>
        </Tooltip>
    );
}

// Обёртка для кнопок с disabled (tooltip на disabled элементах)
interface TooltipDisabledProps {
    content: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    side?: "top" | "right" | "bottom" | "left";
}

function TooltipDisabled({
    content,
    children,
    disabled = false,
    side = "top",
}: TooltipDisabledProps) {
    // Если не disabled, просто рендерим детей без тултипа (или можно сделать чтобы тултип был всегда? Обычно disabled поясняют почему)
    // В ТЗ: "Tooltip на disabled элементах". Скорее всего имеется в виду, что если disabled, то ПОКАЗЫВАТЬ тултип.

    if (!disabled) {
        return <>{children}</>;
    }

    return (
        <Tooltip content={content} side={side}>
            <span className="inline-block cursor-not-allowed" tabIndex={0}>
                <span className="pointer-events-none block">{children}</span>
            </span>
        </Tooltip>
    );
}

export {
    Tooltip,
    TooltipRich,
    TooltipList,
    TooltipIcon,
    TooltipDisabled,
    // Примитивы для кастомных случаев
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
    TooltipContent,
};
