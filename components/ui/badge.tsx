import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-[10px] border px-3 py-1 text-[11px] font-bold tracking-wider  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // Pastel Variants for CRM Statuses
                success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200", // e.g. "Завершено"
                warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200", // e.g. "В печати"
                info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200", // e.g. "Подготовка"
                purple: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200", // e.g. "Контроль"
                gray: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200", // e.g. "Упаковка"
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
