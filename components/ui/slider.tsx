"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
    extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    variant?: "default" | "primary";
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, variant = "primary", ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200">
            <SliderPrimitive.Range
                className={cn(
                    "absolute h-full",
                    variant === "primary" ? "bg-primary" : "bg-slate-600"
                )}
            />
        </SliderPrimitive.Track>
        {props.defaultValue?.map((_, index) => (
            <SliderPrimitive.Thumb
                key={index}
                className={cn(
                    "block h-5 w-5 rounded-full border-2 bg-white shadow-lg transition-transform",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "hover:scale-110 active:scale-95",
                    variant === "primary"
                        ? "border-primary focus-visible:ring-primary"
                        : "border-slate-600 focus-visible:ring-slate-600"
                )}
            />
        )) ||
            (props.value?.map((_, index) => (
                <SliderPrimitive.Thumb
                    key={index}
                    className={cn(
                        "block h-5 w-5 rounded-full border-2 bg-white shadow-lg transition-transform",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "disabled:pointer-events-none disabled:opacity-50",
                        "hover:scale-110 active:scale-95",
                        variant === "primary"
                            ? "border-primary focus-visible:ring-primary"
                            : "border-slate-600 focus-visible:ring-slate-600"
                    )}
                />
            )) || (
                    <SliderPrimitive.Thumb
                        className={cn(
                            "block h-5 w-5 rounded-full border-2 bg-white shadow-lg transition-transform",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                            "disabled:pointer-events-none disabled:opacity-50",
                            "hover:scale-110 active:scale-95",
                            variant === "primary"
                                ? "border-primary focus-visible:ring-primary"
                                : "border-slate-600 focus-visible:ring-slate-600"
                        )}
                    />
                ))}
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

// Слайдер с отображением значения
interface SliderWithValueProps extends Omit<SliderProps, "value" | "onValueChange"> {
    value: number;
    onValueChange: (value: number) => void;
    formatValue?: (value: number) => string;
    label?: string;
}

function SliderWithValue({
    value,
    onValueChange,
    formatValue = (v) => String(v),
    label,
    min = 0,
    max = 100,
    step = 1,
    ...props
}: SliderWithValueProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                {label && <span className="text-sm font-bold text-slate-700">{label}</span>}
                <span className="text-sm font-medium text-slate-900">{formatValue(value)}</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={([v]) => onValueChange(v)}
                min={min}
                max={max}
                step={step}
                {...props}
            />
        </div>
    );
}

// Range слайдер (диапазон)
interface RangeSliderProps extends Omit<SliderProps, "value" | "onValueChange"> {
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    formatValue?: (value: number) => string;
    label?: string;
}

function RangeSlider({
    value,
    onValueChange,
    formatValue = (v) => String(v),
    label,
    min = 0,
    max = 100,
    step = 1,
    ...props
}: RangeSliderProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                {label && <span className="text-sm font-bold text-slate-700">{label}</span>}
                <span className="text-sm font-medium text-slate-900">
                    {formatValue(value[0])} — {formatValue(value[1])}
                </span>
            </div>
            <Slider
                value={value}
                onValueChange={(v) => onValueChange(v as [number, number])}
                min={min}
                max={max}
                step={step}
                {...props}
            />
        </div>
    );
}

// Слайдер для фильтра по цене
interface PriceRangeSliderProps {
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
    currency?: string;
    label?: string;
    className?: string;
}

function PriceRangeSlider({
    value,
    onValueChange,
    min = 0,
    max = 100000,
    step = 100,
    currency = "₽",
    label = "Цена",
    className,
}: PriceRangeSliderProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ru-RU").format(price) + " " + currency;
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <Slider
                value={value}
                onValueChange={(v) => onValueChange(v as [number, number])}
                min={min}
                max={max}
                step={step}
            />
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">От</label>
                    <input
                        type="text"
                        value={formatPrice(value[0])}
                        onChange={(e) => {
                            const num = parseInt(e.target.value.replace(/\D/g, "")) || min;
                            onValueChange([Math.min(num, value[1]), value[1]]);
                        }}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="h-px w-4 bg-slate-300 mt-5" />
                <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">До</label>
                    <input
                        type="text"
                        value={formatPrice(value[1])}
                        onChange={(e) => {
                            const num = parseInt(e.target.value.replace(/\D/g, "")) || max;
                            onValueChange([value[0], Math.max(num, value[0])]);
                        }}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>
        </div>
    );
}

// Слайдер количества
interface QuantitySliderProps {
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    className?: string;
}

function QuantitySlider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    label = "Количество",
    unit = "шт.",
    className,
}: QuantitySliderProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onValueChange(Math.max(min, value - step))}
                        disabled={value <= min}
                        className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                    </button>
                    <span className="text-sm font-bold text-slate-900 min-w-[60px] text-center">
                        {value} {unit}
                    </span>
                    <button
                        type="button"
                        onClick={() => onValueChange(Math.min(max, value + step))}
                        disabled={value >= max}
                        className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>
            <Slider
                value={[value]}
                onValueChange={([v]) => onValueChange(v)}
                min={min}
                max={max}
                step={step}
            />
            <div className="flex justify-between text-xs text-slate-400">
                <span>{min} {unit}</span>
                <span>{max} {unit}</span>
            </div>
        </div>
    );
}

// Слайдер с отметками (шкала)
interface SliderWithMarksProps extends Omit<SliderProps, "value" | "onValueChange"> {
    value: number;
    onValueChange: (value: number) => void;
    marks: { value: number; label: string }[];
    label?: string;
    min?: number;
    max?: number;
}

function SliderWithMarks({
    value,
    onValueChange,
    marks,
    label,
    min,
    max,
    ...props
}: SliderWithMarksProps) {
    const minVal = min ?? Math.min(...marks.map((m) => m.value));
    const maxVal = max ?? Math.max(...marks.map((m) => m.value));

    return (
        <div className="space-y-3">
            {label && (
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                    <span className="text-sm font-medium text-slate-900">
                        {marks.find((m) => m.value === value)?.label || value}
                    </span>
                </div>
            )}
            <div className="pt-2 pb-6 px-1">
                <Slider
                    value={[value]}
                    onValueChange={([v]) => onValueChange(v)}
                    min={minVal}
                    max={maxVal}
                    step={1}
                    {...props}
                />
                <div className="relative mt-2 h-6">
                    {marks.map((mark) => {
                        const percent = ((mark.value - minVal) / (maxVal - minVal)) * 100;
                        return (
                            <button
                                key={mark.value}
                                type="button" // Important so it doesn't submit forms inside a form
                                onClick={() => onValueChange(mark.value)}
                                className="absolute -translate-x-1/2 top-0"
                                style={{ left: `${percent}%` }}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <div className={cn("w-1 h-1.5 rounded-full", value === mark.value ? "bg-primary" : "bg-slate-300")} />
                                    <span
                                        className={cn(
                                            "text-xs font-medium transition-colors whitespace-nowrap",
                                            value === mark.value ? "text-primary" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {mark.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export {
    Slider,
    SliderWithValue,
    RangeSlider,
    PriceRangeSlider,
    QuantitySlider,
    SliderWithMarks,
};
