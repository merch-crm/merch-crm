"use client";

import { tv, type VariantProps } from "tailwind-variants";

const surface = tv({
  base: "h-fit w-full rounded-xl border border-border bg-background shadow-sm",
  variants: {
    padding: {
      none: "",
      xs: "p-2",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof surface> {}

export function Surface({ padding, className, ...props }: SurfaceProps) {
  return (
    <div
      data-slot="heroui-surface"
      className={surface({ padding, className })}
      {...props}
    />
  );
}

const header = tv({
  base: "flex h-14 w-full items-center justify-between border-b border-border bg-background px-4 py-2",
});

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      data-slot="heroui-header"
      className={header({ className })}
      {...props}
    />
  );
}
