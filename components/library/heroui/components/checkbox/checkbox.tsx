"use client";

import type { ComponentPropsWithRef } from "react";
import { Checkbox as CheckboxPrimitive, type CheckboxRenderProps } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTwRenderProps } from "../../utils/compose";
import { Check } from "lucide-react";

const checkboxVariants = tv({
  base: "group flex items-center gap-2 cursor-pointer outline-none",
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
    color: {
      primary: "",
      success: "",
      warning: "",
      danger: "",
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;

export interface CheckboxProps
  extends ComponentPropsWithRef<typeof CheckboxPrimitive>,
    CheckboxVariants {}

export function Checkbox({
  children,
  className,
  color,
  size,
  ...rest
}: CheckboxProps) {
  const colorMap: Record<string, string> = {
    primary: "border-primary bg-primary",
    success: "border-emerald-500 bg-emerald-500",
    warning: "border-amber-500 bg-amber-500",
    danger: "border-red-500 bg-red-500",
  };
  const selectedColor = colorMap[color ?? "primary"];

  return (
    <CheckboxPrimitive
      className={composeTwRenderProps(className, checkboxVariants({ color, size }))}
      data-slot="heroui-checkbox"
      {...rest}
    >
      {(renderProps: CheckboxRenderProps) => {
        const { isSelected, isIndeterminate } = renderProps;
        const defaultChildren = typeof children === 'function' ? (children as (p: CheckboxRenderProps) => React.ReactNode)(renderProps) : children;
        return (
          <>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                isSelected || isIndeterminate
                  ? `${selectedColor} text-white`
                  : "border-border bg-white"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
              {isIndeterminate && (
                <div className="h-0.5 w-2.5 bg-white rounded-full" />
              )}
            </div>
            {defaultChildren && (
              <span className="text-sm text-foreground">{defaultChildren}</span>
            )}
          </>
        );
      }}
    </CheckboxPrimitive>
  );
}
