"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/components/library/custom/utils/cn";

/**
 * BentoCard: Standardized card container for the Bento design system.
 */
export const BentoCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div 
      ref={ref}
      className={cn(
        "w-full max-w-sm rounded-[32px] bg-white border border-slate-100 shadow-crm-md p-6 flex flex-col gap-3 group relative overflow-hidden transition-all duration-700 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
BentoCard.displayName = "BentoCard";

/**
 * BentoIconContainer: Unified icon wrapper with premium aesthetics.
 */
export const BentoIconContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn(
    "size-8 rounded-xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center shadow-sm",
    className
  )}>
    {children}
  </div>
);

/**
 * BentoInputStyles: Shared Tailwind classes for consistent form elements.
 */
export const inputStyles = "w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 transition-all outline-none";

/**
 * BentoTextAreaStyles: Shared Tailwind classes for textareas.
 */
export const textAreaStyles = "w-full min-h-[140px] p-6 bg-slate-50 dark:bg-zinc-900 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-primary-base/10 transition-all outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-zinc-700 shadow-inner";
/**
 * BentoFormField: Container with label and icon for consistent inputs.
 */
export const BentoFormField = ({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={cn("flex flex-col gap-2 relative", className)}>
    <label className="text-[10px] font-black pointer-events-none text-slate-300 dark:text-zinc-600 uppercase tracking-widest leading-none ml-2 mb-1">
      {label}
    </label>
    {children}
  </div>
);

/**
 * BentoInput: Premium input with icon and standardized styling.
 */
export const BentoInput = ({ icon: Icon, className, wrapperClassName, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ComponentType<{ className?: string }>, wrapperClassName?: string }) => (
  <div className={cn("relative group", wrapperClassName)}>
    {Icon && (
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-zinc-700 group-focus-within:text-primary-base transition-colors" />
    )}
    <input 
      className={cn(inputStyles, Icon && "pl-11", className)}
      {...props}
    />
  </div>
);
/**
 * BentoGlow: Reusable background glow effect for Bento cards.
 * Prevents code duplication across bento components.
 */
export const BentoGlow = ({ className }: { className?: string }) => (
  <div 
    className={cn(
      "absolute -right-20 -bottom-20 size-64 bg-primary-base/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary-base/10 transition-all duration-1000",
      className
    )} 
  />
);

/**
 * BentoOverlay: Standardized backdrop overlay for dialogs and sheets.
 * Provides consistent glassmorphism and transition effects.
 */
export const BentoOverlay = ({ onClick, className, ...props }: React.ComponentProps<typeof motion.button>) => (
  <motion.button
    type="button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className={cn(
      "absolute inset-0 bg-slate-950/20 backdrop-blur-md transition-all duration-700 cursor-default outline-none",
      className
    )}
    {...props}
  />
);
