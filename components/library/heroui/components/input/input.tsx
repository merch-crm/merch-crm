"use client";

import type { ComponentPropsWithRef } from "react";
import { Input as InputPrimitive } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTwRenderProps } from "../../utils/compose";

export const inputVariants = tv({
  base: "flex h-10 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:h-9",
  variants: {
    variant: {
      default: "",
      filled: "border-transparent bg-slate-100 focus:bg-white focus:border-primary",
      underline:
        "rounded-none border-0 border-b-2 border-border bg-transparent px-0 focus:border-primary focus:ring-0",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: { variant: "default" },
});

export type InputVariants = VariantProps<typeof inputVariants>;

export interface InputProps
  extends ComponentPropsWithRef<typeof InputPrimitive>,
    InputVariants {}

export function Input({
  className,
  fullWidth,
  variant,
  ...rest
}: InputProps) {
  return (
    <InputPrimitive
      className={composeTwRenderProps(
        className,
        inputVariants({ fullWidth, variant })
      )}
      data-slot="heroui-input"
      {...rest}
    />
  );
}
