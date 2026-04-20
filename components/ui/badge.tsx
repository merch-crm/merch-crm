import * as React from"react"
import { cva, type VariantProps } from"class-variance-authority"
import { cn } from"@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        solid: "border-transparent",
        outline: "bg-background",
        ghost: "border-transparent bg-transparent",
      },
      color: {
        purple: "bg-primary text-white border-primary",
        gray: "bg-slate-500 text-white border-slate-500",
        red: "bg-rose-500 text-white border-rose-500",
        green: "bg-emerald-500 text-white border-emerald-500",
        yellow: "bg-amber-500 text-white border-amber-500",
        black: "bg-slate-900 text-white border-slate-900",
      },
    },
    compoundVariants: [
      { variant: "outline", color: "purple", className: "bg-primary/5 text-primary border-primary/20" },
      { variant: "outline", color: "gray", className: "bg-slate-50 text-slate-600 border-slate-100" },
      { variant: "outline", color: "red", className: "bg-rose-50 text-rose-700 border-rose-200" },
      { variant: "outline", color: "green", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { variant: "outline", color: "yellow", className: "bg-amber-50 text-amber-700 border-amber-200" },
      { variant: "outline", color: "black", className: "bg-slate-50 text-slate-900 border-slate-900" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "purple",
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {
    icon?: React.ComponentType<{ className?: string }>;
}

function Badge({ className, variant = "solid", color = "primary", icon: Icon, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, color }), "inline-flex items-center gap-1.5", className)} 
      {...props}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      {children}
    </div>
  )
}

export type BadgeColor = VariantProps<typeof badgeVariants>["color"];
export { Badge, badgeVariants }
