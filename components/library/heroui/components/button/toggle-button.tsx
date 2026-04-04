"use client";

import { ToggleButton as AriaToggleButton, type ToggleButtonProps as AriaToggleButtonProps } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";

const toggleButton = tv({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground",
  variants: {
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface ToggleButtonProps extends AriaToggleButtonProps, VariantProps<typeof toggleButton> {}

export function ToggleButton({ size, className, ...props }: ToggleButtonProps) {
  return (
    <AriaToggleButton
      data-slot="heroui-toggle-button"
      className={composeTailwindRenderProps(className, toggleButton({ size }))}
      {...props}
    />
  );
}
