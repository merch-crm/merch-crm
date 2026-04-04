"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { tv, type VariantProps } from "tailwind-variants";
import { composeSlotClassName } from "../../utils/compose";

const avatarVariants = tv({
  slots: {
    base: "relative flex shrink-0 overflow-hidden rounded-full",
    image: "aspect-square h-full w-full object-cover",
    fallback:
      "flex h-full w-full items-center justify-center bg-slate-100 font-medium text-slate-600",
  },
  variants: {
    size: {
      xs: { base: "h-6 w-6", fallback: "text-[11px]" },
      sm: { base: "h-8 w-8", fallback: "text-xs" },
      md: { base: "h-10 w-10", fallback: "text-sm" },
      lg: { base: "h-12 w-12", fallback: "text-base" },
      xl: { base: "h-14 w-14", fallback: "text-lg" },
    },
    color: {
      default: {},
      primary: { fallback: "bg-primary/10 text-primary" },
      success: { fallback: "bg-emerald-50 text-emerald-600" },
      warning: { fallback: "bg-amber-50 text-amber-600" },
      danger: { fallback: "bg-red-50 text-red-600" },
    },
    variant: {
      circle: { base: "rounded-full" },
      rounded: { base: "rounded-xl" },
      square: { base: "rounded-none" },
    },
  },
  defaultVariants: { size: "md", variant: "circle", color: "default" },
});

type AvatarVariants = VariantProps<typeof avatarVariants>;

const AvatarContext = createContext<{
  slots?: ReturnType<typeof avatarVariants>;
}>({});

export interface AvatarProps
  extends Omit<ComponentPropsWithRef<typeof AvatarPrimitive.Root>, "color">,
    AvatarVariants {}

export function Avatar({
  children,
  className,
  color,
  size,
  variant,
  ...props
}: AvatarProps) {
  const slots = useMemo(
    () => avatarVariants({ color, size, variant }),
    [color, size, variant]
  );

  return (
    <AvatarContext value={{ slots }}>
      <AvatarPrimitive.Root
        className={slots.base({ className })}
        data-slot="heroui-avatar"
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
    </AvatarContext>
  );
}

export function AvatarImage({
  className,
  ...props
}: ComponentPropsWithRef<typeof AvatarPrimitive.Image>) {
  const { slots } = useContext(AvatarContext);
  return (
    <AvatarPrimitive.Image
      className={composeSlotClassName(slots?.image, className)}
      data-slot="heroui-avatar-image"
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>) {
  const { slots } = useContext(AvatarContext);
  return (
    <AvatarPrimitive.Fallback
      className={composeSlotClassName(slots?.fallback, className)}
      data-slot="heroui-avatar-fallback"
      {...props}
    />
  );
}
