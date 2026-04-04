"use client";

import { tv, type VariantProps } from "tailwind-variants";

const buttonGroup = tv({
  base: "inline-flex h-auto w-fit items-center justify-center overflow-hidden rounded-md border border-border bg-transparent shadow-sm",
  variants: {
    isAttached: {
      true: "divide-x divide-border",
    },
    isDisabled: {
      true: "opacity-40",
    },
  },
  defaultVariants: {
    isAttached: true,
  },
});

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof buttonGroup> {}

export function ButtonGroup({ isAttached, isDisabled, className, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="heroui-button-group"
      className={buttonGroup({ isAttached, isDisabled, className })}
      {...props}
    />
  );
}
