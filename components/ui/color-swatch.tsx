"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { ColorPicker } from "./color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export type SwatchVariant = "default" | "square" | "circle";
export type SwatchSize = "sm" | "md" | "lg";

interface ColorSwatchProps {
  color: string;
  onChange: (color: string) => void;
  showHex?: boolean;
  minimal?: boolean;
  variant?: SwatchVariant;
  size?: SwatchSize;
  className?: string;
  label?: string;
}

export function ColorSwatch({ 
  color, 
  onChange, 
  showHex = true, 
  minimal: _minimal = false, 
  variant = "default",
  size = "md",
  className,
  label
}: ColorSwatchProps) {
  
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-14"
  };

  const roundedClasses = {
    default: "rounded-element",
    square: "rounded-element",
    circle: "rounded-full"
  };

  const isCompact = variant === "square" || variant === "circle";
  const showText = showHex && !isCompact;

  return (
    <div className={cn("space-y-1.5", isCompact ? "w-max" : "", className)}>
      {label && (
        <label className={cn("text-sm font-bold text-slate-900 mb-1.5 block", isCompact ? "" : "ml-1")}>
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn",
              !isCompact && "justify-between px-4 border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-400 w-full",
              isCompact && "justify-center p-0 border-0 bg-transparent focus-visible:ring-2 focus-visible:ring-primary/20",
              sizeClasses[size],
              roundedClasses[variant],
              variant === "square" && size === "md" && "w-12",
              variant === "square" && size === "sm" && "w-8",
              variant === "square" && size === "lg" && "w-14",
              variant === "circle" && size === "md" && "w-12",
              variant === "circle" && size === "sm" && "w-8",
              variant === "circle" && size === "lg" && "w-14"
            )}
            title={color}
          >
            <div className={cn("flex items-center h-full", isCompact ? "justify-center w-full" : "justify-start")}>
              <div
                className={cn(
                  "border border-black/10 shadow-sm shrink-0 transition-transform duration-200 group-hover/btn:scale-[1.02]",
                  variant === "circle" ? "rounded-full" : isCompact ? "rounded-element" : "rounded-lg",
                  isCompact ? "w-full h-full" : (size === "sm" ? "size-4" : size === "lg" ? "size-8" : "size-6")
                )}
                style={{ backgroundColor: color || "#3B82F6" }}
              />
              {showText && (
                <span className="text-[14px] font-semibold text-slate-900 truncate uppercase ml-3">
                  {color || "#3B82F6"}
                </span>
              )}
            </div>
            {!isCompact && (
              <ChevronDown className="w-4 h-4 text-slate-400 opacity-50 shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto border-none shadow-none bg-transparent" align="start" sideOffset={8}>
          <ColorPicker color={color || "#3B82F6"} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
