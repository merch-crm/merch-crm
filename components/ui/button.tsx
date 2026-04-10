"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-element)] text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                solid: "shadow-sm active:shadow-none hover:brightness-105",
                outline: "border-2 bg-transparent hover:bg-slate-50",
                ghost: "bg-transparent hover:bg-slate-50",
                link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto",
                action: "bg-slate-50 text-slate-400 border border-slate-200/60 hover:bg-white hover:shadow-sm active:scale-90",
            },
            color: {
                primary: "",
                success: "",
                warning: "",
                danger: "",
                neutral: "",
                brand: "",
                dark: "",
            },
            size: {
                md: "h-12 px-6 py-2.5",
                sm: "h-9 rounded-[var(--radius-sm)] px-3",
                lg: "h-12 rounded-[var(--radius-xl)] px-8 text-base",
                xl: "h-14 rounded-[var(--radius-xl)] px-10 text-lg",
                icon: "h-10 w-10 p-0",
                xs: "h-8 w-8 p-0",
            },
        },
        compoundVariants: [
            // Solid Colors
            { variant: "solid", color: "primary", className: "bg-primary text-primary-foreground hover:bg-primary/90" },
            { variant: "solid", color: "success", className: "bg-emerald-500 text-white hover:bg-emerald-600" },
            { variant: "solid", color: "warning", className: "bg-amber-500 text-white hover:bg-amber-600" },
            { variant: "solid", color: "danger", className: "bg-rose-500 text-white hover:bg-rose-600" },
            { variant: "solid", color: "neutral", className: "bg-slate-100 text-slate-900 hover:bg-slate-200" },
            { variant: "solid", color: "brand", className: "bg-indigo-600 text-white hover:bg-indigo-700" },
            { variant: "solid", color: "dark", className: "bg-slate-950 text-white hover:bg-slate-900 shadow-xl shadow-black/10" },

            // Outline Colors
            { variant: "outline", color: "primary", className: "border-primary text-primary hover:bg-primary/5" },
            { variant: "outline", color: "success", className: "border-emerald-500 text-emerald-600 hover:bg-emerald-50/50" },
            { variant: "outline", color: "warning", className: "border-amber-500 text-amber-600 hover:bg-amber-50/50" },
            { variant: "outline", color: "danger", className: "border-rose-500 text-rose-600 hover:bg-rose-50/50" },
            { variant: "outline", color: "neutral", className: "border-slate-200 text-slate-600 hover:bg-slate-50" },
            { variant: "outline", color: "brand", className: "border-indigo-600 text-indigo-600 hover:bg-indigo-50/50" },
            { variant: "outline", color: "dark", className: "border-slate-950 text-slate-950 hover:bg-slate-50" },

            // Ghost Colors
            { variant: "ghost", color: "primary", className: "text-primary hover:bg-primary/5" },
            { variant: "ghost", color: "success", className: "text-emerald-600 hover:bg-emerald-50" },
            { variant: "ghost", color: "warning", className: "text-amber-600 hover:bg-amber-50" },
            { variant: "ghost", color: "danger", className: "text-rose-600 hover:bg-rose-50" },
            { variant: "ghost", color: "neutral", className: "text-slate-600 hover:bg-slate-100" },
            { variant: "ghost", color: "brand", className: "text-indigo-600 hover:bg-indigo-50" },
            { variant: "ghost", color: "dark", className: "text-slate-950 hover:bg-slate-100" },
        ],
        defaultVariants: {
            variant: "solid",
            color: "primary",
            size: "md",
        },
    }
)

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    loadingText?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, color, size, asChild = false, isLoading, loadingText, children, type = "button", ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp type={asChild ? undefined : type} className={cn(buttonVariants({ variant, color, size, className }))} ref={ref} disabled={isLoading || props.disabled} {...props}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingText || children}
                </>
              ) : (
                children
              )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

const Icon = ({
  as: IconComp,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  as: React.ComponentType<{ className?: string }>;
}) => {
  return <IconComp className={cn('size-5 shrink-0 text-slate-400', className)} {...props} />;
};

export { 
  Button,
  Icon,
  Icon as ButtonIcon,
  buttonVariants 
}

