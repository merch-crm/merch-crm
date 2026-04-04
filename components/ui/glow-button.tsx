"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    glowColor?: string;
    animate?: boolean;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
    ({
        className,
        variant = "primary",
        size = "md",
        icon: Icon,
        iconPosition = "right",
        animate = true,
        children,
        ...props
    }, ref) => {

        const sizeClasses = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-13 px-8 text-base",
            xl: "h-15 px-10 text-lg",
        };

        const variantClasses = {
            primary: "bg-[#1A2233] text-white hover:bg-[#252E44] border-transparent shadow-sm",
            secondary: "bg-white text-[#1A2233] border-slate-200 hover:bg-slate-50 shadow-sm",
            outline: "bg-transparent text-[#1A2233] border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
            ghost: "bg-transparent text-slate-600 hover:text-[#1A2233] hover:bg-slate-100/50 border-transparent",
        };

        return (
            <button
                ref={ref}
                type={props.type || "button"}
                className={cn(
                    "relative inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-full border transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none group overflow-hidden",
                    sizeClasses[size],
                    variantClasses[variant],
                    className
                )}
                style={{
                    // @ts-expect-error - Custom CSS property for dynamic glow positioning
                    "--glow-color": "transparent",
                }}
                {...props}
            >
                {/* Glow Effect Removed */}
                <div className="absolute inset-0 bg-transparent pointer-events-none" />

                {Icon && iconPosition === "left" && (
                    <Icon className={cn("shrink-0 transition-transform duration-300", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", animate && "group-hover:-translate-x-0.5")} />
                )}

                <span className="relative z-10">{children}</span>

                {Icon && iconPosition === "right" && (
                    <Icon className={cn("shrink-0 transition-transform duration-300", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", animate && "group-hover:translate-x-0.5")} />
                )}
            </button>
        );
    }
);

GlowButton.displayName = "GlowButton";
