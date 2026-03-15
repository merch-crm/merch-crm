"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  icon,
  actions,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

interface CalculatorSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CalculatorSection({
  title,
  icon,
  children,
  className,
}: CalculatorSectionProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface CalculatorResultsProps {
  total: number;
  perItem: number;
  quantity: number;
  itemLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function CalculatorResults({
  total,
  perItem,
  quantity,
  itemLabel = "шт",
  children,
  className,
}: CalculatorResultsProps) {
  return (
    <div className={cn("lg:col-span-1 space-y-3", className)}>
      {/* Main result card */}
      <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
        <div className="text-sm text-white/70 mb-1">Итого</div>
        <div className="text-3xl font-bold mb-4">
          {total.toLocaleString("ru-RU")} ₽
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div>
            <div className="text-sm text-white/70">За единицу</div>
            <div className="text-lg font-semibold">{perItem.toLocaleString("ru-RU")} ₽</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70">Количество</div>
            <div className="text-lg font-semibold">
              {quantity.toLocaleString("ru-RU")} {itemLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {children && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {children}
        </div>
      )}
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: number;
  type?: "cost" | "fee" | "discount";
}

export function ResultRow({ label, value, type = "cost" }: ResultRowProps) {
  const isNegative = value < 0;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          type === "discount" || isNegative
            ? "text-emerald-600"
            : type === "fee"
            ? "text-amber-600"
            : "text-slate-900"
        )}
      >
        {isNegative ? "" : "+"}{value.toLocaleString("ru-RU")} ₽
      </span>
    </div>
  );
}
