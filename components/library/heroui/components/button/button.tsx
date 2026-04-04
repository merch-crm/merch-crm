"use client";

import type { ComponentPropsWithRef } from "react";
import { Button as ButtonPrimitive } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTwRenderProps } from "../../utils/compose";

export const buttonVariants = tv({
  base: "relative isolate inline-flex h-10 w-fit origin-center items-center justify-center gap-2 rounded-3xl px-4 text-sm font-medium whitespace-nowrap outline-none select-none transition-all duration-250 transform-gpu active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
  variants: {
    variant: {
      primary:
        "bg-[var(--color-accent,var(--primary))] text-white hover:bg-[var(--color-accent-hover,var(--primary-hover))]",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200",
      tertiary:
        "bg-slate-100 text-slate-600 hover:bg-slate-200",
      outline:
        "border border-border bg-transparent hover:bg-slate-100/60 text-foreground",
      ghost:
        "bg-transparent hover:bg-slate-100 text-foreground",
      danger:
        "bg-red-500 text-white hover:bg-red-600",
      "danger-soft":
        "bg-red-50 text-red-600 hover:bg-red-100",
    },
    size: {
      sm: "h-9 px-3 text-xs md:h-8",
      md: "",
      lg: "h-11 text-base md:h-10",
    },
    isIconOnly: {
      true: "w-10 p-0 md:w-9",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  compoundVariants: [
    { isIconOnly: true, size: "sm", class: "w-9 md:w-8" },
    { isIconOnly: true, size: "lg", class: "w-11 md:w-10" },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ComponentPropsWithRef<typeof ButtonPrimitive>,
    ButtonVariants {}

export function Button({
  children,
  className,
  fullWidth,
  isIconOnly,
  size,
  variant,
  ...rest
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={composeTwRenderProps(
        className,
        buttonVariants({ fullWidth, isIconOnly, size, variant })
      )}
      data-slot="heroui-button"
      {...rest}
    >
      {(renderProps) =>
        typeof children === "function" ? children(renderProps) : children
      }
    </ButtonPrimitive>
  );
}
