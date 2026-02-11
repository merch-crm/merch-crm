import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"



const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] text-sm font-bold tracking-tight ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] [box-shadow:0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:[box-shadow:0_8px_20px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.1)] active:shadow-none active:scale-[0.98] transition-all",
                destructive:
                    "bg-[#ff463c] text-white hover:bg-[#e32419] [box-shadow:0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:[box-shadow:0_8px_20px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.1)] active:shadow-none",
                "btn-dark": "bg-[#1f1f1f] text-white hover:bg-black [box-shadow:0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:[box-shadow:0_8px_20px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.1)] active:shadow-none transition-all",
                "btn-black": "bg-[#0f172a] text-white hover:bg-black [box-shadow:0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:[box-shadow:0_8px_20px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.1)] active:shadow-none transition-all",
                outline:
                    "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 [box-shadow:0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:[box-shadow:0_8px_20px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.1)] active:shadow-none",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-6 py-2.5",
                sm: "h-9 rounded-[var(--radius-sm)] px-3",
                lg: "h-12 rounded-[var(--radius-xl)] px-8 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
