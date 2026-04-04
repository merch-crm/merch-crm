"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badgeVariants = tv({
  slots: {
    base: "inline-flex items-center",
    label:
      "rounded-full px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap",
  },
  variants: {
    variant: {
      solid: { label: "text-white" },
      flat: { label: "" },
      outline: { label: "border bg-transparent" },
      dot: { label: "bg-transparent text-foreground" },
    },
    color: {
      default: { label: "" },
      primary: {},
      success: {},
      warning: {},
      danger: {},
    },
    size: {
      sm: { label: "px-1.5 py-0 text-[11px]" },
      md: {},
      lg: { label: "px-2.5 py-1 text-sm" },
    },
    placement: {
      "top-right": { base: "" },
      "top-left": { base: "" },
      "bottom-right": { base: "" },
      "bottom-left": { base: "" },
    },
  },
  compoundVariants: [
    { variant: "solid", color: "primary", class: { label: "bg-primary text-white" } },
    { variant: "solid", color: "success", class: { label: "bg-emerald-500 text-white" } },
    { variant: "solid", color: "warning", class: { label: "bg-amber-500 text-white" } },
    { variant: "solid", color: "danger", class: { label: "bg-red-500 text-white" } },
    { variant: "solid", color: "default", class: { label: "bg-slate-200 text-slate-700" } },
    { variant: "flat", color: "primary", class: { label: "bg-primary/10 text-primary" } },
    { variant: "flat", color: "success", class: { label: "bg-emerald-50 text-emerald-700" } },
    { variant: "flat", color: "warning", class: { label: "bg-amber-50 text-amber-700" } },
    { variant: "flat", color: "danger", class: { label: "bg-red-50 text-red-700" } },
    { variant: "flat", color: "default", class: { label: "bg-slate-100 text-slate-600" } },
    { variant: "outline", color: "primary", class: { label: "border-primary text-primary" } },
    { variant: "outline", color: "success", class: { label: "border-emerald-500 text-emerald-600" } },
    { variant: "outline", color: "warning", class: { label: "border-amber-500 text-amber-600" } },
    { variant: "outline", color: "danger", class: { label: "border-red-500 text-red-600" } },
    { variant: "outline", color: "default", class: { label: "border-border text-foreground" } },
  ],
  defaultVariants: { variant: "flat", color: "default", size: "md" },
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

const BadgeContext = createContext<{
  slots?: ReturnType<typeof badgeVariants>;
}>({});

export interface BadgeProps
  extends Omit<ComponentPropsWithRef<"span">, "color">,
    BadgeVariants {}

export function Badge({
  children,
  className,
  color,
  placement,
  size,
  variant,
  ...props
}: BadgeProps) {
  const slots = useMemo(
    () => badgeVariants({ color, placement, size, variant }),
    [color, placement, size, variant]
  );

  return (
    <BadgeContext value={{ slots }}>
      <span className={slots.base({ className })} data-slot="heroui-badge" {...props}>
        {typeof children === "string" || typeof children === "number" ? (
          <BadgeLabel>{children}</BadgeLabel>
        ) : (
          children
        )}
      </span>
    </BadgeContext>
  );
}

export function BadgeLabel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"span">) {
  const { slots } = useContext(BadgeContext);
  return (
    <span className={slots?.label({ className })} data-slot="heroui-badge-label" {...props}>
      {children}
    </span>
  );
}
