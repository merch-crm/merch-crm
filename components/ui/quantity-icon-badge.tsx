import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const quantityIconBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black text-white",
  {
    variants: {
      color: {
        default: "bg-primary shadow-md shadow-primary/20",
        success: "bg-emerald-500 shadow-md shadow-emerald-500/20",
        warning: "bg-amber-500 shadow-md shadow-amber-500/20",
        danger: "bg-rose-500 shadow-md shadow-rose-500/20",
        dark: "bg-slate-950 shadow-md shadow-slate-950/20",
        light: "bg-gray-200 text-gray-700 shadow-md shadow-gray-200/20",
        primary: "bg-indigo-600 shadow-md shadow-indigo-600/20",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
);

export interface QuantityIconBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof quantityIconBadgeVariants> {
  value: number | string;
  unit: string;
  icon: LucideIcon;
}

export function QuantityIconBadge({
  value,
  unit,
  icon: Icon,
  color,
  className,
  ...props
}: QuantityIconBadgeProps) {
  return (
    <div
      className={cn(quantityIconBadgeVariants({ color }), className)}
      {...props}
    >
      <Icon size={14} className="opacity-80" />
      {value} <span className="text-[10px] font-medium opacity-80">{unit}</span>
    </div>
  );
}

