"use client";

import { tv, type VariantProps } from "tailwind-variants";

const text = tv({
  base: "text-foreground",
  variants: {
    variant: {
        h1: "scroll-m-20 text-4xl font-extrabold  lg:text-5xl",
        h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold  first:mt-0",
        h3: "scroll-m-20 text-2xl font-semibold ",
        h4: "scroll-m-20 text-xl font-semibold ",
        p: "leading-7 [&:not(:first-child)]:mt-6",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof text> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export function Text({ as: Component = "p", variant, className, ...props }: TextProps) {
  return (
    <Component
      data-slot="heroui-text"
      className={text({ variant, className })}
      {...props}
    />
  );
}
