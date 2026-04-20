import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const quantityBadgeVariants = cva(
  "inline-flex items-baseline gap-1 px-3 py-1 rounded-full text-sm font-bold border",
  {
    variants: {
      color: {
        gray: "bg-slate-100 text-slate-700 border-slate-200",
        green: "bg-emerald-50 text-emerald-700 border-emerald-200",
        yellow: "bg-amber-50 text-amber-700 border-amber-200",
        red: "bg-rose-50 text-rose-700 border-rose-200",
        black: "bg-slate-900 text-white border-slate-800",
        purple: "bg-primary/5 text-primary border-primary/20",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);

const unitVariants: Record<string, string> = {
  gray: "text-slate-500",
  green: "text-emerald-500",
  yellow: "text-amber-500",
  red: "text-rose-500",
  black: "text-slate-400",
  purple: "text-primary/70",
};

export interface QuantityBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof quantityBadgeVariants> {
  value: number | string;
  unit: string;
}

export function QuantityBadge({ value, unit, color, className, ...props }: QuantityBadgeProps) {
  return (
    <div
      className={cn(quantityBadgeVariants({ color }), className)}
      {...props}
    >
      {value} <span className={cn("text-[10px] font-medium tracking-wide", unitVariants[color ?? "default"])}>{unit}</span>
    </div>
  );
}
