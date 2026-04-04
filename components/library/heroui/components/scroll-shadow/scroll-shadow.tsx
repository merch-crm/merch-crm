"use client";

import { tv, type VariantProps } from "tailwind-variants";

const scrollShadow = tv({
  base: "relative max-h-[400px] overflow-auto scrollbar-hide data-[shadow=true]:[mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]",
  variants: {
    orientation: {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden flex-row",
    },
    hideScrollBar: {
      true: "scrollbar-hide",
      false: "",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    hideScrollBar: true,
  },
});

export interface ScrollShadowProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof scrollShadow> {
    isEnabled?: boolean;
}

export function ScrollShadow({ orientation, hideScrollBar, isEnabled = true, className, ...props }: ScrollShadowProps) {
  return (
    <div
      data-slot="heroui-scroll-shadow"
      data-shadow={isEnabled}
      className={scrollShadow({ orientation, hideScrollBar, className })}
      {...props}
    />
  );
}
