"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CheckboxProps {
    checked: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    onChange?: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
    indeterminate?: boolean;
}

const Checkbox = ({
    checked,
    onCheckedChange,
    onChange,
    className,
    disabled = false,
    id,
    indeterminate: propsIndeterminate
}: CheckboxProps) => {
    const isIndeterminate = checked === "indeterminate" || propsIndeterminate;
    const isChecked = checked === true && !propsIndeterminate;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        const nextValue = isChecked ? false : true;
        if (onCheckedChange) onCheckedChange(nextValue);
        if (onChange) onChange(nextValue);
    };

    return (
        <button
            id={id}
            type="button"
            role="checkbox"
            aria-checked={isIndeterminate ? "mixed" : isChecked}
            aria-disabled={disabled}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!disabled) {
                        const nextValue = isChecked ? false : true;
                        if (onCheckedChange) onCheckedChange(nextValue);
                        if (onChange) onChange(nextValue);
                    }
                }
            }}
            className={cn("w-[16px] h-[16px] rounded-[4px] border-2 transition-all duration-200 flex items-center justify-center cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                (isChecked || isIndeterminate)
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                disabled && "opacity-50 cursor-not-allowed grayscale",
                className
            )}
        >
            <AnimatePresence initial={false}>
                {isChecked && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                    </motion.div>
                )}
                {isIndeterminate && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <Minus className="w-2.5 h-2.5 stroke-[4]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
export { Checkbox as Root, Checkbox };
