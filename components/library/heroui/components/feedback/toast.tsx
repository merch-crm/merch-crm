"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { X, Check, AlertCircle, Info, ShieldAlert } from "lucide-react";
import React from "react";
import { cn } from "../../utils/cn";

const toast = tv({
  slots: {
    base: "pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[2rem] border p-6 shadow-premium transition-all duration-700 group/toast",
    content: "flex flex-col gap-1.5",
    title: "text-[11px] font-black uppercase tracking-[0.2em] leading-none",
    description: "text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed",
    close: "absolute right-3 top-3 rounded-xl size-8 flex items-center justify-center bg-white/10 text-white/40 opacity-0 transition-all duration-500 hover:text-white hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-white/10 group-hover/toast:opacity-100",
  },
  variants: {
    variant: {
      default: {
        base: "bg-white border-slate-100 text-slate-900",
        title: "text-slate-900",
        description: "text-slate-400",
        close: "bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-900/10",
      },
      destructive: {
        base: "bg-rose-950 border-rose-900 text-white shadow-rose-950/20",
        title: "text-white",
        description: "text-rose-300",
        close: "bg-white/5 text-rose-300 hover:text-white hover:bg-white/10 focus:ring-white/10",
      },
      success: {
        base: "bg-emerald-950 border-emerald-900 text-white shadow-emerald-950/20",
        title: "text-white",
        description: "text-emerald-300",
        close: "bg-white/5 text-emerald-300 hover:text-white hover:bg-white/10 focus:ring-white/10",
      },
      warning: {
        base: "bg-amber-950 border-amber-900 text-white shadow-amber-950/20",
        title: "text-white",
        description: "text-amber-300",
        close: "bg-white/5 text-amber-300 hover:text-white hover:bg-white/10 focus:ring-white/10",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toast> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Toast({ title, description, icon, variant, className, ...props }: ToastProps) {
  const slots = toast({ variant });
  
  const defaultIcons = {
    default: <Info className="size-5 text-primary-base" />,
    destructive: <ShieldAlert className="size-5 text-rose-400" />,
    success: <Check className="size-5 text-emerald-400" />,
    warning: <AlertCircle className="size-5 text-amber-400" />,
  };

  return (
    <div
      role="alert"
      data-slot="heroui-toast"
      className={slots.base({ className })}
      {...props}
    >
      <div className="flex gap-4 items-start relative z-10">
         <div className="size-11 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
            {icon || defaultIcons[variant || 'default']}
         </div>
         <div className={slots.content()}>
            {title && <span className={slots.title()}>{title}</span>}
            {description && <span className={slots.description()}>{description}</span>}
         </div>
      </div>
      <button 
        type="button"
        aria-label="Close notification"
        className={slots.close()}
      >
        <X className="size-4 stroke-[3px]" />
      </button>

      <div className="absolute -right-16 -bottom-16 size-48 bg-white/5 rounded-full blur-3xl -z-10 group-hover/toast:bg-white/10 transition-colors duration-1000" />
    </div>
  );
}

export function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={toast().title({ className })} {...props} />
}

export function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={toast().description({ className })} {...props} />
}

export function ToastClose({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
    return (
        <button 
          type="button"
          aria-label="Close notification"
          className={toast().close({ className })} 
          {...props}
        >
            <X className="size-4 stroke-[3px]" />
        </button>
    )
}

export interface ToastContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function ToastContent({ className, ...props }: ToastContentProps) {
    return <div className="flex flex-col gap-1.5" {...props} />
}
