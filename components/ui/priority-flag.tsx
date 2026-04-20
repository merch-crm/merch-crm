import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityFlagVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-black transition-colors duration-200",
  {
    variants: {
      color: {
        red: "bg-rose-50 text-rose-700 border-rose-200",
        yellow: "bg-amber-50 text-amber-700 border-amber-200",
        gray: "bg-slate-100 text-slate-700 border-slate-200",
        green: "bg-emerald-50 text-emerald-700 border-emerald-200",
        purple: "bg-primary/5 text-primary border-primary/20",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);

export interface PriorityFlagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof priorityFlagVariants> {
    VariantProps<typeof priorityFlagVariants> {
  icon?: React.ReactNode;
}

function PriorityFlag({ className, color, icon, children, ...props }: PriorityFlagProps) {
  return (
    <div
      className={cn(priorityFlagVariants({ color }), className)}
      {...props}
    >
      {icon && icon}
      {children}
    </div>
  );
}

export { PriorityFlag, priorityFlagVariants };
