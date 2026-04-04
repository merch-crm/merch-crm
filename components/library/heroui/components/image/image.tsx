"use client";

import ImageNext from "next/image";
import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../utils/cn";

const imageVariants = tv({
  base: "relative inline-block overflow-hidden rounded-xl",
  variants: {
    shadow: {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    isZoomed: {
      true: "hover:scale-110 transition-transform duration-500",
    },
    isBlurred: {
      true: "before:absolute before:inset-0 before:bg-black/20 before:backdrop-blur-md",
    },
  },
  defaultVariants: {
    shadow: "none",
    radius: "xl",
  },
});

type ImageVariants = VariantProps<typeof imageVariants>;

export interface ImageProps extends ComponentPropsWithRef<"img">, ImageVariants {
  containerClassName?: string;
}

export function Image({
  className,
  containerClassName,
  shadow,
  isZoomed,
  isBlurred,
  alt,
  ...props
}: ImageProps) {
  return (
    <div
      className={cn(
        imageVariants({ shadow, isZoomed, isBlurred }),
        containerClassName
      )}
      data-slot="heroui-image"
    >
      <ImageNext
        src={props.src || ""}
        alt={alt || "Image"}
        className={cn("h-auto w-full object-cover", className)}
        width={props.width ? Number(props.width) : 800}
        height={props.height ? Number(props.height) : 600}
        {...Object.fromEntries(Object.entries(props).filter(([k]) => k !== 'width' && k !== 'height' && k !== 'src'))}
      />
    </div>
  );
}
