"use client";

import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const skeletonVariants = tv({
  base: "animate-pulse rounded-xl bg-slate-200",
  variants: {
    variant: {
      default: "rounded-xl",
      circular: "rounded-full",
      rectangular: "rounded-none",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={skeletonVariants({ className, variant })}
      data-slot="heroui-skeleton"
      {...props}
    />
  );
}
