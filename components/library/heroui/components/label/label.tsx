"use client";

import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindClassName } from "../../utils/compose";

const label = tv({
  base: "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
});

export interface LabelProps extends AriaLabelProps {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <AriaLabel
      data-slot="heroui-label"
      className={composeTailwindClassName(className as string, label())}
      {...props}
    />
  );
}
