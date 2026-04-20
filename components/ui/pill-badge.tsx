import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        solid: "text-white",
      },
      color: {
        black: "",
        gray: "",
        green: "",
        yellow: "",
        red: "",
        purple: "",
        light: "",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-3 py-1",
        lg: "text-sm px-4 py-1.5",
      },
    },
    compoundVariants: [
      { variant: "solid", color: "black", className: "bg-slate-950" },
      { variant: "solid", color: "gray", className: "bg-slate-500" },
      { variant: "solid", color: "green", className: "bg-emerald-500" },
      { variant: "solid", color: "yellow", className: "bg-amber-500" },
      { variant: "solid", color: "red", className: "bg-rose-500" },
      { variant: "solid", color: "purple", className: "bg-primary shadow-lg shadow-primary/20" },
      { variant: "solid", color: "light", className: "bg-gray-100 text-gray-600 shadow-sm" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "green",
      size: "md",
    },
  }
);

export interface PillBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof pillBadgeVariants> {
  icon?: React.ReactNode;
}

function PillBadge({ 
  className, 
  variant, 
  color, 
  size, 
  icon, 
  children, 
  ...props 
}: PillBadgeProps) {
  return (
    <div
      className={cn(pillBadgeVariants({ variant, color, size }), className, "gap-1.5")}
      {...props}
    >
      {icon && icon}
      {children}
    </div>
  );
}

export { PillBadge, pillBadgeVariants };
