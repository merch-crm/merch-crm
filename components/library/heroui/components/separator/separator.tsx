"use client";

import { Separator as AriaSeparator, type SeparatorProps as AriaSeparatorProps } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTailwindClassName } from "../../utils/compose";

const separator = tv({
  base: "bg-border shrink-0",
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export interface SeparatorProps extends AriaSeparatorProps, VariantProps<typeof separator> {}

export function Separator({ orientation, className, ...props }: SeparatorProps) {
  return (
    <AriaSeparator
      data-slot="heroui-separator"
      orientation={orientation}
      className={composeTailwindClassName(className as string, separator({ orientation }))}
      {...props}
    />
  );
}
