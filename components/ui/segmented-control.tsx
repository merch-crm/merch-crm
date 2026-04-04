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
    /** Background color for the container; default: bg-white */
    bgClassName?: string;
    /** Optional stable ID for shared layout animations */
    layoutId?: string;
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
    bgClassName = "bg-white",
    layoutId: propLayoutId,
}: SegmentedControlProps<T>) {
    const internalLayoutId = React.useId();
    const activeLayoutId = propLayoutId || internalLayoutId;

    return (
        <div 
            className={cn(
                "flex items-center gap-1.5 p-1 rounded-[18px] relative overflow-hidden border border-slate-200/80 shadow-sm", 
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
                            "relative flex-1 h-11 px-4 lg:px-6 rounded-[14px] font-bold text-[14px] flex items-center justify-center gap-2 outline-none z-10",
                            isActive
                                ? "text-white"
                                : "text-slate-500 hover:text-slate-900"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId={activeLayoutId}
                                className="absolute inset-0 bg-slate-950 rounded-[14px] shadow-lg shadow-black/20 -z-10"
                                initial={false}
                                transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
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
