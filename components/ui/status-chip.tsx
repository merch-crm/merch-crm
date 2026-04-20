import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const statusChipVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200",
  {
    variants: {
      variant: {
        solid: "border",
        outline: "border-2",
      },
      color: {
        purple: "",
        green: "",
        yellow: "",
        red: "",
        black: "",
        gray: "",
      },
    },
    compoundVariants: [
      // Solid Variants
      { variant: "solid", color: "purple", className: "bg-primary text-white border-primary-hover shadow-sm" },
      { variant: "solid", color: "green", className: "bg-emerald-600 text-white border-emerald-700 shadow-sm" },
      { variant: "solid", color: "yellow", className: "bg-amber-500 text-white border-amber-600 shadow-sm" },
      { variant: "solid", color: "red", className: "bg-rose-600 text-white border-rose-700 shadow-sm" },
      { variant: "solid", color: "black", className: "bg-slate-950 text-white border-slate-900 shadow-sm" },
      { variant: "solid", color: "gray", className: "bg-slate-100 text-slate-700 border-slate-200 shadow-sm" },
      
      // Outline Variants
      { variant: "outline", color: "purple", className: "border-primary/20 text-primary bg-primary/5" },
      { variant: "outline", color: "green", className: "border-emerald-200 text-emerald-700 bg-emerald-50/50" },
      { variant: "outline", color: "yellow", className: "border-amber-300 text-amber-800 bg-amber-50/50" },
      { variant: "outline", color: "red", className: "border-rose-200 text-rose-700 bg-rose-50/50" },
      { variant: "outline", color: "black", className: "border-slate-300 text-slate-800 bg-slate-50" },
      { variant: "outline", color: "gray", className: "border-slate-200 text-slate-400 bg-transparent" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "black",
    },
  }
);

export interface StatusChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof statusChipVariants> {
  icon?: React.ReactNode;
  onRemove?: () => void;
}

function StatusChip({
  className,
  variant,
  color = "black",
  icon,
  onRemove,
  children,
  ...props
}: StatusChipProps) {
  return (
    <div
      className={cn(statusChipVariants({ variant, color }), className)}
      {...props}
    >
      {icon && icon}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "p-0.5 rounded transition-colors ml-1",
            variant === "solid" 
              ? color === "gray" 
                ? "hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                : "hover:bg-white/10 text-white/50 hover:text-white" 
              : "hover:bg-black/5 text-current opacity-50 hover:opacity-100"
          )}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export { StatusChip, statusChipVariants };
