import * as React from"react"
import { cva, type VariantProps } from"class-variance-authority"
import { cn } from"@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[10px] border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        solid: "border-transparent",
        outline: "bg-background",
        ghost: "border-transparent bg-transparent",
      },
      color: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/80 border-primary",
        neutral: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-destructive",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500",
        warning: "bg-amber-500 text-white hover:bg-amber-600 border-amber-500",
        info: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
        purple: "bg-purple-500 text-white hover:bg-purple-600 border-purple-500",
        gray: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
      },
    },
    compoundVariants: [
      { variant: "outline", color: "primary", className: "bg-primary/5 text-primary border-primary/20" },
      { variant: "outline", color: "neutral", className: "bg-secondary/5 text-secondary border-secondary/20" },
      { variant: "outline", color: "danger", className: "bg-destructive/5 text-destructive border-destructive/20" },
      { variant: "outline", color: "success", className: "bg-emerald-50 text-emerald-700 border-emerald-500/20" },
      { variant: "outline", color: "warning", className: "bg-amber-50 text-amber-700 border-amber-500/20" },
      { variant: "outline", color: "info", className: "bg-blue-50 text-blue-700 border-blue-500/20" },
      { variant: "outline", color: "purple", className: "bg-purple-50 text-purple-700 border-purple-500/20" },
      { variant: "outline", color: "gray", className: "bg-gray-50 text-gray-700 border-gray-200" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
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
