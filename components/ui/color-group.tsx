"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Стандартный набор цветов для палитры MerchCRM
 */
export const _SWATCH_COLORS = [
  "#F43F5E", // Rose
  "#D946EF", // Fuchsia
  "#8B5CF6", // Violet
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#84CC16"  // Lime
];

interface ColorGroupProps {
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  colors?: string[];
  className?: string;
}

/**
 * ColorGroup — компонент для выбора цвета из фиксированного набора образцов.
 * Используется в формах и настройках, где требуется быстрый выбор без открытия полного пикера.
 */
export function ColorGroup({
  selectedColor,
  onColorChange,
  colors = _SWATCH_COLORS,
  className
}: ColorGroupProps) {
  return (
    <div 
      className={cn("flex items-center gap-1.5", className)} 
      role="radiogroup" 
      aria-label="Выберите цвет из палитры"
    >
      {colors.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onColorChange?.(color)}
            className={cn(
              "relative size-[34px] flex-shrink-0 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
              isSelected ? "z-10" : "z-0"
            )}
            style={{ 
              backgroundColor: color,
              boxShadow: isSelected ? `inset 0 0 0 1.5px ${color}, inset 0 0 0 4px #F4F4F5` : 'none'
            }}
            title={color}
            aria-label={`Выбрать цвет ${color}`}
          >
            {isSelected && (
              <Check className="size-[14px] text-white" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}
