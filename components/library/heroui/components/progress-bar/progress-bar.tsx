"use client";

import type { ComponentPropsWithRef } from "react";
import { ProgressBar as ProgressBarPrimitive } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTwRenderProps } from "../../utils/compose";

const progressVariants = tv({
  base: "flex flex-col gap-1.5 w-full",
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

const trackSizes: Record<string, string> = { sm: "h-1", md: "h-2", lg: "h-3" };
const fillColors: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export interface ProgressBarProps
  extends ComponentPropsWithRef<typeof ProgressBarPrimitive>,
    VariantProps<typeof progressVariants> {
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  className,
  color,
  label,
  showValue = false,
  size,
  ...rest
}: ProgressBarProps) {
  const trackH = trackSizes[size ?? "md"];
  const fillC = fillColors[color ?? "primary"];

  return (
    <ProgressBarPrimitive
      className={composeTwRenderProps(className, progressVariants({ color, size }))}
      data-slot="heroui-progress"
      {...rest}
    >
      {({ percentage, valueText }) => (
        <>
          {(label || showValue) && (
            <div className="flex justify-between text-sm">
              {label && <span className="font-medium text-foreground">{label}</span>}
              {showValue && <span className="text-muted-foreground">{valueText}</span>}
            </div>
          )}
          <div className={`${trackH} w-full overflow-hidden rounded-full bg-slate-200`}>
            <div
              className={`${trackH} ${fillC} rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      )}
    </ProgressBarPrimitive>
  );
}
