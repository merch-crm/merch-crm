"use client";

import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";

const link = tv({
  base: "relative inline-flex items-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
  variants: {
    variant: {
      default: "text-foreground hover:text-foreground/80 underline-offset-4 hover:underline",
      primary: "text-primary hover:text-primary-600 underline-offset-4 hover:underline",
      muted: "text-muted-foreground hover:text-foreground",
    },
    isBlock: {
      true: "bg-transparent px-2 py-1 hover:bg-muted rounded-md",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LinkProps extends AriaLinkProps, VariantProps<typeof link> {}

export function Link({ variant, isBlock, className, ...props }: LinkProps) {
  return (
    <AriaLink
      data-slot="heroui-link"
      className={composeTailwindRenderProps(className, (renderProps) => 
        link({ 
            variant, 
            isBlock, 
            className: renderProps.isFocused ? "text-primary" : "" 
        })
      )}
      {...props}
    />
  );
}
