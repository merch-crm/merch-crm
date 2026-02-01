"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export function PremiumCheckbox({
    checked,
    onChange,
    className,
    disabled = false
}: PremiumCheckboxProps) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onChange(!checked);
            }}
            className={cn(
                "w-[18px] h-[18px] rounded-[5px] border-2 transition-all duration-200 flex items-center justify-center cursor-pointer select-none",
                checked
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                disabled && "opacity-50 cursor-not-allowed grayscale",
                className
            )}
        >
            <AnimatePresence initial={false}>
                {checked && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <Check className="w-3 h-3 stroke-[4]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
