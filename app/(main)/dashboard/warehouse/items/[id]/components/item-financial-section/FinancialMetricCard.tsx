"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { FinancialMetricCardProps } from "./types";

export function FinancialMetricCard({
  label,
  value,
  secondaryValue,
  icon: Icon,
  bgColor,
  iconColor,
  currencySymbol,
  isEditing,
  editValue,
  onEditChange,
  onDoubleClick,
  className
}: FinancialMetricCardProps) {
  const isLucideIcon = typeof Icon !== "string";

  return (
    <div className={cn(
      "group relative p-5 rounded-3xl bg-white border border-slate-100 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col gap-3 text-left h-full overflow-hidden",
      className
    )}>
      {/* Background ambient glow */}
      <div className={cn("absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40", bgColor)}></div>

      <div className="flex items-center gap-3 relative z-10">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
          bgColor,
          iconColor
        )}>
          {isLucideIcon ? (
            <Icon className="w-5 h-5 relative z-10" />
          ) : (
            <span className="text-xl font-black relative z-10">{Icon}</span>
          )}
        </div>
        <span className="block text-sm font-bold text-slate-500 transition-colors group-hover:text-slate-800">
          {label}
        </span>
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input type="number" value={editValue ?? ""} onChange={(e) => onEditChange?.(e.target.value)}
              aria-label={label}
              className="text-3xl font-black text-slate-900 bg-transparent border-none p-0 w-full focus-visible:ring-0 shadow-none rounded-none h-auto"
            />
          </div>
        ) : (
          <div className={cn(onDoubleClick && "cursor-pointer")} onDoubleClick={onDoubleClick}>
            <p className="text-3xl font-black text-slate-900 transition-colors">
              {typeof value === "number" ? Math.round(value).toLocaleString('ru-RU') : value} <span className="text-xl font-bold opacity-40">{currencySymbol}</span>
            </p>
            {secondaryValue && (
              <span className="text-xs font-bold text-slate-400 mt-1 block">
                {secondaryValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
