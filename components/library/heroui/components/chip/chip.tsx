"use client";

import { tv, type VariantProps } from "tailwind-variants";

const chip = tv({
  base: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      flat: "border-transparent",
      outline: "bg-transparent",
      solid: "border-transparent text-primary-foreground",
    },
    color: {
      default: "",
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      danger: "",
    },
  },
  compoundVariants: [
    // Flat
    { variant: "flat", color: "default", class: "bg-muted text-muted-foreground" },
    { variant: "flat", color: "primary", class: "bg-primary/10 text-primary" },
    { variant: "flat", color: "secondary", class: "bg-secondary/10 text-secondary" },
    { variant: "flat", color: "success", class: "bg-success/10 text-success" },
    { variant: "flat", color: "warning", class: "bg-warning/10 text-warning" },
    { variant: "flat", color: "danger", class: "bg-danger/10 text-danger" },
    // Solid
    { variant: "solid", color: "default", class: "bg-foreground text-background" },
    { variant: "solid", color: "primary", class: "bg-primary" },
    { variant: "solid", color: "secondary", class: "bg-secondary" },
    { variant: "solid", color: "success", class: "bg-success" },
    { variant: "solid", color: "warning", class: "bg-warning" },
    { variant: "solid", color: "danger", class: "bg-danger" },
    // Outline
    { variant: "outline", color: "default", class: "border-border text-muted-foreground" },
    { variant: "outline", color: "primary", class: "border-primary/20 text-primary" },
    { variant: "outline", color: "secondary", class: "border-secondary/20 text-secondary" },
    { variant: "outline", color: "success", class: "border-success/20 text-success" },
    { variant: "outline", color: "warning", class: "border-warning/20 text-warning" },
    { variant: "outline", color: "danger", class: "border-danger/20 text-danger" },
  ],
  defaultVariants: {
    variant: "flat",
    color: "default",
  },
});

import { composeTailwindClassName } from "../../utils/compose";

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof chip> {}

export function Chip({ variant, color, className, ...props }: ChipProps) {
  return (
    <div
      data-slot="heroui-chip"
      className={composeTailwindClassName(className as string, chip({ variant, color }))}
      {...props}
    />
  );
}
