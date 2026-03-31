"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { QUICK_SIZES } from "../../types";

interface QuickSizeButtonsProps {
    currentWidth: number;
    currentHeight: number;
    onSelect: (widthMm: number, heightMm: number) => void;
}

export const QuickSizeButtons = memo(function QuickSizeButtons({
    currentWidth,
    currentHeight,
    onSelect,
}: QuickSizeButtonsProps) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {QUICK_SIZES.map((size) => {
                const isSelected =
                    currentWidth === size.widthMm && currentHeight === size.heightMm;

                return (
                    <button
                        key={size.label}
                        type="button"
                        onClick={() => onSelect(size.widthMm, size.heightMm)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                            isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        )}
                    >
                        {size.label}
                    </button>
                );
            })}
        </div>
    );
});
