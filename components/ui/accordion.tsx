"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Базовые примитивы
const AccordionRoot = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b border-slate-200 last:border-b-0", className)}
        {...props}
    />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                "flex flex-1 items-center justify-between py-4 text-left text-sm font-bold text-slate-900 transition-all",
                "hover:text-primary [&[data-state=open]>svg]:rotate-180",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300" />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
    >
        <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// Простой аккордеон
interface AccordionItemData {
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface AccordionProps {
    items: AccordionItemData[];
    type?: "single" | "multiple";
    defaultValue?: string | string[];
    collapsible?: boolean;
    className?: string;
}

function Accordion({
    items = [],
    type = "single",
    defaultValue,
    collapsible = true,
    className,
}: AccordionProps) {
    return (
        <AccordionRoot
            type={type as "single"}
            defaultValue={defaultValue as string}
            collapsible={collapsible}
            className={cn("w-full", className)}
        >
            {(items || []).map((item) => (
                <AccordionItem key={item.id} value={item.id} disabled={item.disabled}>
                    <AccordionTrigger>
                        <span className="flex items-center gap-3">
                            {item.icon && <span className="text-slate-500">{item.icon}</span>}
                            {item.title}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
        </AccordionRoot>
    );
}

// Аккордеон в карточках
interface AccordionCardsProps extends AccordionProps {
    gap?: "sm" | "md" | "lg";
}

function AccordionCards({
    items = [],
    type = "single",
    defaultValue,
    collapsible = true,
    gap = "md",
    className,
}: AccordionCardsProps) {
    const gapClasses = {
        sm: "space-y-2",
        md: "space-y-3",
        lg: "space-y-3",
    };

    return (
        <AccordionRoot
            type={type as "single"}
            defaultValue={defaultValue as string}
            collapsible={collapsible}
            className={cn(gapClasses[gap], className)}
        >
            {(items || []).map((item) => (
                <AccordionPrimitive.Item
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden data-[state=open]:shadow-sm transition-shadow"
                >
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between p-4 text-left text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 [&[data-state=open]>svg]:rotate-180">
                            <span className="flex items-center gap-3">
                                {item.icon && <span className="text-slate-500">{item.icon}</span>}
                                {item.title}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300" />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="overflow-hidden text-sm text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-4 pb-4 pt-0">{item.content}</div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionRoot>
    );
}

// Аккордеон с Plus/Minus иконками (стиль FAQ)
function AccordionFAQ({
    items = [],
    type = "single",
    defaultValue,
    collapsible = true,
    className,
}: AccordionProps) {
    return (
        <AccordionRoot
            type={type as "single"}
            defaultValue={defaultValue as string}
            collapsible={collapsible}
            className={cn("w-full divide-y divide-slate-200", className)}
        >
            {(items || []).map((item) => (
                <AccordionPrimitive.Item
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    className="group"
                >
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-5 text-left text-base font-bold text-slate-900 transition-all hover:text-primary">
                            {item.title}
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-4 group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                                <Plus className="w-4 h-4 group-data-[state=open]:hidden" />
                                <Minus className="w-4 h-4 hidden group-data-[state=open]:block" />
                            </div>
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="overflow-hidden text-sm text-slate-600 leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="pb-5">{item.content}</div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionRoot>
    );
}

// Аккордеон для настроек (с описанием и иконкой)
interface AccordionSettingsItemData extends AccordionItemData {
    description?: string;
}

interface AccordionSettingsProps {
    items: AccordionSettingsItemData[];
    type?: "single" | "multiple";
    defaultValue?: string | string[];
    className?: string;
}

function AccordionSettings({
    items = [],
    type = "multiple",
    defaultValue,
    className,
}: AccordionSettingsProps) {
    return (
        <AccordionRoot
            type={type as "multiple"}
            defaultValue={defaultValue as string[]}
            className={cn("space-y-3", className)}
        >
            {(items || []).map((item) => (
                <AccordionPrimitive.Item
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                >
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 p-4 text-left transition-all hover:bg-slate-50 [&[data-state=open]]:bg-slate-50 [&[data-state=open]>div:last-child>svg]:rotate-180">
                            {item.icon && (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-primary">{item.icon}</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                {item.description && (
                                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                )}
                            </div>
                            <div className="shrink-0">
                                <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-300" />
                            </div>
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-0 pt-4">
                            {item.content}
                        </div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionRoot>
    );
}

// Аккордеон с бордером слева (стиль документации)
function AccordionBordered({
    items = [],
    type = "single",
    defaultValue,
    collapsible = true,
    className,
}: AccordionProps) {
    return (
        <AccordionRoot
            type={type as "single"}
            defaultValue={defaultValue as string}
            collapsible={collapsible}
            className={cn("space-y-2", className)}
        >
            {(items || []).map((item) => (
                <AccordionPrimitive.Item
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    className="border-l-2 border-slate-200 pl-4 data-[state=open]:border-primary transition-colors"
                >
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-2 text-left text-sm font-bold text-slate-900 transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180">
                            <span className="flex items-center gap-2">
                                {item.icon && <span className="text-slate-400">{item.icon}</span>}
                                {item.title}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300" />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="overflow-hidden text-sm text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="pb-3 pt-1">{item.content}</div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionRoot>
    );
}

// Нумерованный аккордеон (для пошаговых инструкций)
interface AccordionStepsProps {
    items: Omit<AccordionItemData, "icon">[];
    type?: "single" | "multiple";
    defaultValue?: string | string[];
    className?: string;
}

function AccordionSteps({
    items = [],
    type = "single",
    defaultValue,
    className,
}: AccordionStepsProps) {
    return (
        <AccordionRoot
            type={type as "single"}
            defaultValue={defaultValue as string}
            collapsible
            className={cn("space-y-3", className)}
        >
            {(items || []).map((item, index) => (
                <AccordionPrimitive.Item
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden group"
                >
                    <AccordionPrimitive.Header className="flex">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 p-4 text-left transition-all hover:bg-slate-50 [&[data-state=open]>div:first-child]:bg-primary [&[data-state=open]>div:first-child]:text-white [&[data-state=open]>div:last-child>svg]:rotate-180">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm font-bold text-slate-600 transition-colors">
                                {index + 1}
                            </div>
                            <span className="flex-1 text-sm font-bold text-slate-900">{item.title}</span>
                            <div className="shrink-0">
                                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300" />
                            </div>
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="overflow-hidden text-sm text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-4 pb-4 pl-16">{item.content}</div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionRoot>
    );
}

export {
    Accordion,
    AccordionCards,
    AccordionFAQ,
    AccordionSettings,
    AccordionBordered,
    AccordionSteps,
    // Примитивы для кастомных случаев
    AccordionRoot,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    type AccordionItemData,
    type AccordionSettingsItemData,
};
