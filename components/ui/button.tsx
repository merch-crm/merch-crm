"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none tracking-normal",
    {
        variants: {
            variant: {
                solid: "shadow-sm active:shadow-none hover:brightness-105 active:scale-[0.98]",
                outline: "border bg-transparent hover:bg-slate-50 active:scale-[0.98]",
                ghost: "bg-transparent hover:bg-slate-50 active:scale-[0.98]",
                link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto font-medium text-slate-500 hover:text-slate-900",
            },
            color: {
                dark: "focus-visible:ring-slate-950",
                danger: "focus-visible:ring-rose-500",
                warning: "focus-visible:ring-amber-500",
                system: "focus-visible:ring-indigo-500",
                neutral: "focus-visible:ring-slate-400",
                success: "focus-visible:ring-emerald-500",
            },
            size: {
                md: "h-[46px] px-8 rounded-2xl text-base",
                sm: "h-9 px-6 rounded-xl text-sm",
                lg: "h-14 px-10 rounded-2xl text-base",
                icon: "size-[46px] rounded-2xl",
            },
        },
        compoundVariants: [
            // Solid Colors
            { variant: "solid", color: "dark", className: "bg-slate-950 text-white hover:bg-slate-900 shadow-xl shadow-black/10" },
            { variant: "solid", color: "danger", className: "bg-rose-600 text-white hover:bg-rose-700" },
            { variant: "solid", color: "warning", className: "bg-amber-500 text-white hover:bg-amber-600" },
            { variant: "solid", color: "system", className: "bg-indigo-600 text-white hover:bg-indigo-700" },
            { variant: "solid", color: "neutral", className: "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-none border-none" },
            { variant: "solid", color: "success", className: "bg-emerald-600 text-white hover:bg-emerald-700" },

            // Outline Colors
            { variant: "outline", color: "dark", className: "border-slate-950 text-slate-950 hover:bg-slate-50" },
            { variant: "outline", color: "danger", className: "border-rose-600 text-rose-600 hover:bg-rose-50/50" },
            { variant: "outline", color: "warning", className: "border-amber-500 text-amber-600 hover:bg-amber-50/50" },
            { variant: "outline", color: "system", className: "border-indigo-600 text-indigo-600 hover:bg-indigo-50/50" },
            { variant: "outline", color: "neutral", className: "border-slate-300 text-slate-600 hover:bg-slate-50" },
            { variant: "outline", color: "success", className: "border-emerald-600 text-emerald-600 hover:bg-emerald-50/50" },

            // Ghost Colors
            { variant: "ghost", color: "dark", className: "text-slate-950 hover:bg-slate-100" },
            { variant: "ghost", color: "danger", className: "text-rose-600 hover:bg-rose-50" },
            { variant: "ghost", color: "warning", className: "text-amber-600 hover:bg-amber-50" },
            { variant: "ghost", color: "system", className: "text-indigo-600 hover:bg-indigo-50" },
            { variant: "ghost", color: "neutral", className: "text-slate-600 hover:bg-slate-100" },
            { variant: "ghost", color: "success", className: "text-emerald-600 hover:bg-emerald-50" },
        ],
        defaultVariants: {
            variant: "solid",
            color: "dark",
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
        
        if (asChild) {
            return (
                <Comp className={cn(buttonVariants({ variant, color, size, className }))} ref={ref} {...props}>
                    {children}
                </Comp>
            )
        }

        return (
            <Comp type={type} className={cn(buttonVariants({ variant, color, size, className }))} ref={ref} disabled={isLoading || props.disabled} {...props}>
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

