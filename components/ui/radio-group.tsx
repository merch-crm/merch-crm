"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const RadioGroupRoot = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
        className={cn("grid gap-3", className)}
        {...props}
        ref={ref}
    />
));
RadioGroupRoot.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
            "aspect-square h-5 w-5 rounded-full border-2 border-slate-300 text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:border-primary",
            "transition-colors",
            className
        )}
        {...props}
    >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Простая радио-группа
interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    options: RadioOption[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
    orientation?: "horizontal" | "vertical";
    className?: string;
}

function RadioGroup({
    options,
    value,
    onValueChange,
    label,
    orientation = "vertical",
    className,
}: RadioGroupProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <span className="text-sm font-bold text-slate-700 ml-1">{label}</span>
            )}
            <RadioGroupRoot
                value={value}
                onValueChange={onValueChange}
                className={cn(
                    orientation === "horizontal" ? "flex flex-wrap gap-4" : "grid gap-3"
                )}
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            "flex items-center gap-3 cursor-pointer",
                            option.disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <RadioGroupItem value={option.value} disabled={option.disabled} />
                        <div>
                            <span className="text-sm font-medium text-slate-900">{option.label}</span>
                            {option.description && (
                                <p className="text-xs text-slate-500">{option.description}</p>
                            )}
                        </div>
                    </label>
                ))}
            </RadioGroupRoot>
        </div>
    );
}

// Радио-карточки (визуально выделенные)
interface RadioCardOption extends RadioOption {
    icon?: React.ReactNode;
}

interface RadioCardsProps {
    options: RadioCardOption[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

function RadioCards({
    options,
    value,
    onValueChange,
    label,
    columns = 2,
    className,
}: RadioCardsProps) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <span className="text-sm font-bold text-slate-700 ml-1">{label}</span>
            )}
            <RadioGroupRoot
                value={value}
                onValueChange={onValueChange}
                className={cn("grid gap-3", gridCols[columns])}
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            "relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                            value === option.value
                                ? "border-primary bg-primary/5"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                            option.disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <RadioGroupItem
                            value={option.value}
                            disabled={option.disabled}
                            className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {option.icon && (
                                    <span className="text-slate-600">{option.icon}</span>
                                )}
                                <span className="text-sm font-bold text-slate-900">{option.label}</span>
                            </div>
                            {option.description && (
                                <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            )}
                        </div>
                    </label>
                ))}
            </RadioGroupRoot>
        </div>
    );
}

// Радио-кнопки в виде сегментов (как табы)
interface RadioSegmentsProps {
    options: RadioOption[];
    value: string;
    onValueChange: (value: string) => void;
    size?: "sm" | "md" | "lg";
    className?: string;
}

function RadioSegments({
    options,
    value,
    onValueChange,
    size = "md",
    className,
}: RadioSegmentsProps) {
    const sizeClasses = {
        sm: "h-8 text-xs px-3",
        md: "h-10 text-sm px-4",
        lg: "h-12 text-sm px-6",
    };

    return (
        <RadioGroupRoot
            value={value}
            onValueChange={onValueChange}
            className={cn(
                "inline-flex rounded-lg bg-slate-100 p-1",
                className
            )}
        >
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn(
                        "relative flex items-center justify-center rounded-md font-bold cursor-pointer transition-all",
                        sizeClasses[size],
                        value === option.value
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700",
                        option.disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    <RadioGroupPrimitive.Item
                        value={option.value}
                        disabled={option.disabled}
                        className="sr-only"
                    />
                    {option.label}
                </label>
            ))}
        </RadioGroupRoot>
    );
}

// Радио-карточки (визуально выделенные)
interface ClientTypeRadioProps {
    value: "b2b" | "b2c";
    onValueChange: (value: "b2b" | "b2c") => void;
    className?: string;
}

function ClientTypeRadio({ value, onValueChange, className }: ClientTypeRadioProps) {
    return (
        <RadioCards
            value={value}
            onValueChange={(v) => onValueChange(v as "b2b" | "b2c")}
            label="Тип клиента"
            columns={2}
            className={className}
            options={[
                {
                    value: "b2c",
                    label: "B2C",
                    description: "Физическое лицо, розничный покупатель",
                    icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ),
                },
                {
                    value: "b2b",
                    label: "B2B",
                    description: "Юридическое лицо, оптовый клиент",
                    icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    ),
                },
            ]}
        />
    );
}

interface RadioIconOption {
    value: string;
    label: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

interface RadioIconsProps {
    options: RadioIconOption[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
    className?: string;
}

function RadioIcons({
    options,
    value,
    onValueChange,
    label,
    className,
}: RadioIconsProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <span className="text-sm font-bold text-slate-700 ml-1">{label}</span>
            )}
            <RadioGroupRoot
                value={value}
                onValueChange={onValueChange}
                className="flex gap-2"
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all min-w-[72px]",
                            value === option.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700",
                            option.disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <RadioGroupPrimitive.Item
                            value={option.value}
                            disabled={option.disabled}
                            className="sr-only"
                        />
                        <span className="w-6 h-6">{option.icon}</span>
                        <span className="text-xs font-bold">{option.label}</span>
                    </label>
                ))}
            </RadioGroupRoot>
        </div>
    );
}

interface ColorOption {
    value: string;
    color: string;
    label?: string;
    disabled?: boolean;
}

interface RadioColorsProps {
    options: ColorOption[];
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
    className?: string;
}

function RadioColors({
    options,
    value,
    onValueChange,
    label,
    className,
}: RadioColorsProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <span className="text-sm font-bold text-slate-700 ml-1">{label}</span>
            )}
            <RadioGroupRoot
                value={value}
                onValueChange={onValueChange}
                className="flex flex-wrap gap-2"
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            "relative cursor-pointer",
                            option.disabled && "cursor-not-allowed opacity-50"
                        )}
                        title={option.label}
                    >
                        <RadioGroupPrimitive.Item
                            value={option.value}
                            disabled={option.disabled}
                            className="sr-only peer"
                        />
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all",
                                value === option.value
                                    ? "border-slate-900 scale-110"
                                    : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: option.color }}
                        />
                        {value === option.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    className={cn(
                                        "w-4 h-4",
                                        isLightColor(option.color) ? "text-slate-900" : "text-white"
                                    )}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </label>
                ))}
            </RadioGroupRoot>
        </div>
    );
}

function isLightColor(hex: string): boolean {
    const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
}

export {
    RadioGroup,
    RadioCards,
    RadioSegments,
    RadioIcons,
    RadioColors,
    ClientTypeRadio,
    RadioGroupRoot,
    RadioGroupItem,
};
