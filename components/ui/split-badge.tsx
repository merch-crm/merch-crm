import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const splitBadgeVariants = cva(
  "inline-flex overflow-hidden rounded-md border shadow-sm",
  {
    variants: {
      color: {
      color: {
        gray: "border-slate-200",
        green: "border-emerald-200",
        yellow: "border-amber-200",
        red: "border-rose-200",
        black: "border-neutral-700",
        purple: "border-primary/20",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);

const labelStyles: Record<string, string> = {
const labelStyles: Record<string, string> = {
  gray: "bg-slate-50 text-slate-500",
  green: "bg-emerald-50 text-emerald-600",
  yellow: "bg-amber-50 text-amber-600",
  red: "bg-rose-50 text-rose-600",
  black: "bg-neutral-800 text-neutral-300",
  purple: "bg-primary/5 text-primary",
};

const valueStyles: Record<string, string> = {
const valueStyles: Record<string, string> = {
  gray: "bg-slate-800 text-white",
  green: "bg-emerald-500 text-white",
  yellow: "bg-amber-500 text-white",
  red: "bg-rose-500 text-white",
  black: "bg-neutral-950 text-white",
  purple: "bg-primary text-white",
};

const unitStyles: Record<string, string> = {
  gray: "text-slate-300",
  green: "text-white/70",
  yellow: "text-white/70",
  red: "text-white/70",
  black: "text-slate-400",
  purple: "text-white/70",
};

export interface SplitBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof splitBadgeVariants> {
  label: string;
  value: number | string;
  unit: string;
}

export function SplitBadge({ label, value, unit, color, className, ...props }: SplitBadgeProps) {
  const c = color ?? "gray";
  return (
    <div
      className={cn(splitBadgeVariants({ color }), className)}
      {...props}
    >
      <div className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center", labelStyles[c])}>
        {label}
      </div>
      <div className={cn("px-2.5 py-1 text-xs font-black flex items-baseline gap-0.5", valueStyles[c])}>
        {value} <span className={cn("text-[9px] font-medium", unitStyles[c])}>{unit}</span>
      </div>
    </div>
  );
}
