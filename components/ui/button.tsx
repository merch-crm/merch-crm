import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer font-bold",
    {
        variants: {
            variant: {
                solid: "text-white",
                outline: "bg-transparent border-2",
                ghost: "bg-transparent",
                link: "bg-transparent underline-offset-4 hover:underline",
            },
            color: {
                black: "focus-visible:ring-slate-950",
                red: "focus-visible:ring-rose-500",
                yellow: "focus-visible:ring-amber-500",
                purple: "focus-visible:ring-primary",
                gray: "focus-visible:ring-slate-500",
                green: "focus-visible:ring-emerald-500",
            },
            size: {
                md: "h-[46px] px-8 rounded-2xl text-base",
                sm: "h-[38px] px-6 rounded-xl text-sm",
                lg: "h-[56px] px-10 rounded-2xl text-lg",
                xl: "h-[64px] px-12 rounded-[22px] text-xl font-black tracking-tight",
                icon: "h-11 w-11 rounded-xl",
                "icon-sm": "h-9 w-9 rounded-lg",
            },
        },
        compoundVariants: [
            // Solid Colors
            { variant: "solid", color: "black", className: "bg-slate-950 text-white hover:bg-slate-900 shadow-xl shadow-black/10" },
            { variant: "solid", color: "red", className: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-900/20" },
            { variant: "solid", color: "yellow", className: "bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-900/20" },
            { variant: "solid", color: "purple", className: "bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/30" },
            { variant: "solid", color: "gray", className: "bg-slate-500 text-white hover:bg-slate-600 shadow-xl shadow-slate-900/20" },
            { variant: "solid", color: "green", className: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-900/20" },

            // Outline Colors
            { variant: "outline", color: "black", className: "border-slate-950 text-slate-950 hover:bg-slate-50" },
            { variant: "outline", color: "red", className: "border-rose-500 text-rose-600 hover:bg-rose-50/50" },
            { variant: "outline", color: "yellow", className: "border-amber-500 text-amber-600 hover:bg-amber-50/50" },
            { variant: "outline", color: "purple", className: "border-primary text-primary hover:bg-primary/5" },
            { variant: "outline", color: "gray", className: "border-slate-500 text-slate-600 hover:bg-slate-50" },
            { variant: "outline", color: "green", className: "border-emerald-500 text-emerald-600 hover:bg-emerald-50/50" },

            // Ghost Colors
            { variant: "ghost", color: "black", className: "text-slate-950 hover:bg-slate-100" },
            { variant: "ghost", color: "red", className: "text-rose-500 hover:bg-rose-50" },
            { variant: "ghost", color: "yellow", className: "text-amber-500 hover:bg-amber-50" },
            { variant: "ghost", color: "purple", className: "text-primary hover:bg-primary/5" },
            { variant: "ghost", color: "gray", className: "text-slate-500 hover:bg-slate-50" },
            { variant: "ghost", color: "green", className: "text-emerald-500 hover:bg-emerald-50" },

            // Link Colors
            { variant: "link", color: "black", className: "text-slate-950" },
            { variant: "link", color: "red", className: "text-rose-600" },
            { variant: "link", color: "yellow", className: "text-amber-600" },
            { variant: "link", color: "purple", className: "text-primary" },
            { variant: "link", color: "gray", className: "text-slate-500" },
            { variant: "link", color: "green", className: "text-emerald-600" },
        ],
        defaultVariants: {
            variant: "solid",
            color: "black",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, color, size, asChild = false, isLoading = false, loadingText, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, color: color as any, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingText || children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
