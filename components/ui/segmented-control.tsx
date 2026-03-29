"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedControlOption<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    /** Background color for the container; default: bg-slate-100/80 */
    bgClassName?: string;
}

/**
 * Reusable segmented control (pill-switcher) component.
 * Features a smooth sliding animation with Framer Motion.
 * Matches Warehouse Design System: rounded-[18px] container, rounded-[14px] active tab.
 */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
    bgClassName = "bg-slate-200/50",
}: SegmentedControlProps<T>) {
    const layoutId = React.useId();

    return (
        <div 
            className={cn(
                "flex items-center gap-1.5 p-1 rounded-[18px] relative overflow-hidden border border-slate-200/60", 
                bgClassName, 
                className
            )}
        >
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "relative flex-1 h-11 px-4 lg:px-6 rounded-[14px] font-bold text-[14px] transition-all flex items-center justify-center gap-2 outline-none z-10 active:scale-95",
                            isActive
                                ? "text-white"
                                : "text-slate-500 hover:text-slate-900"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute inset-0 bg-slate-950 rounded-[14px] shadow-lg shadow-black/20 -z-10"
                                initial={false}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            />
                        )}
                        {Icon && <Icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "text-white scale-110" : "text-slate-400")} />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
