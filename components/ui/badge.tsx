import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-[10px] border px-3 py-1 text-[11px] font-bold tracking-wider  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "badge-base bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "badge-base bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "badge-base bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "badge-base text-foreground",
                // Pastel Variants for CRM Statuses
                success: "badge-base badge-success", // e.g. "Завершено"
                warning: "badge-base badge-warning", // e.g. "В печати"
                info: "badge-base badge-info", // e.g. "Подготовка"
                purple: "badge-base badge-purple", // e.g. "Контроль"
                gray: "badge-base bg-gray-100 text-gray-800 hover:bg-gray-200", // e.g. "Упаковка"
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
