"use client";

import type { ComponentPropsWithRef } from "react";
import { Switch as SwitchPrimitive } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTwRenderProps } from "../../utils/compose";

const switchVariants = tv({
  base: "group inline-flex items-center gap-2 cursor-pointer outline-none",
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

export type SwitchVariants = VariantProps<typeof switchVariants>;

export interface SwitchProps
  extends ComponentPropsWithRef<typeof SwitchPrimitive>,
    SwitchVariants {}

export function Switch({
  children,
  className,
  color,
  size,
  ...rest
}: SwitchProps) {
  const sizeMap: Record<string, { track: string; thumb: string; translate: string }> = {
    sm: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
    md: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
    lg: { track: "h-7 w-[52px]", thumb: "h-6 w-6", translate: "translate-x-6" },
  };
  const colorMap: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  const s = sizeMap[size ?? "md"];
  const c = colorMap[color ?? "primary"];

  return (
    <SwitchPrimitive
      className={composeTwRenderProps(className, switchVariants({ color, size }))}
      data-slot="heroui-switch"
      {...rest}
    >
      {(values) => (
        <>
          <span
            className={`${s.track} relative inline-flex shrink-0 rounded-full border-2 border-transparent transition-colors ${
              values.isSelected ? c : "bg-slate-200"
            }`}
          >
            <span
              className={`${s.thumb} pointer-events-none rounded-full bg-white shadow-sm ring-0 transition-transform ${
                values.isSelected ? s.translate : "translate-x-0"
              }`}
            />
          </span>
          {children && (
            <span className="text-sm text-foreground">
              {typeof children === "function" ? children(values) : children}
            </span>
          )}
        </>
      )}
    </SwitchPrimitive>
  );
}
