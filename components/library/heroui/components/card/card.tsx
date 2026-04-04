"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const cardVariants = tv({
  slots: {
    base: "relative flex flex-col gap-3 overflow-hidden rounded-3xl p-4 shadow-sm",
    header: "flex flex-col",
    title: "text-sm leading-6 font-medium text-foreground",
    description: "text-sm leading-5 text-muted-foreground",
    content: "flex flex-1 flex-col gap-1",
    footer: "flex flex-row items-center",
  },
  variants: {
    variant: {
      transparent: { base: "border-none bg-transparent shadow-none" },
      default: { base: "bg-white border border-border" },
      secondary: { base: "bg-slate-50" },
      tertiary: { base: "bg-slate-100" },
    },
  },
  defaultVariants: { variant: "default" },
});

type CardVariants = VariantProps<typeof cardVariants>;

const CardContext = createContext<{
  slots?: ReturnType<typeof cardVariants>;
}>({});

export interface CardProps extends ComponentPropsWithRef<"div">, CardVariants {}

export function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  const slots = useMemo(() => cardVariants({ variant }), [variant]);

  return (
    <CardContext value={{ slots }}>
      <div className={slots.base({ className })} data-slot="heroui-card" {...props}>
        {children}
      </div>
    </CardContext>
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { slots } = useContext(CardContext);
  return (
    <div
      className={slots?.header({ className })}
      data-slot="heroui-card-header"
      {...props}
    />
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"h3">) {
  const { slots } = useContext(CardContext);
  return (
    <h3
      className={slots?.title({ className })}
      data-slot="heroui-card-title"
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"p">) {
  const { slots } = useContext(CardContext);
  return (
    <p
      className={slots?.description({ className })}
      data-slot="heroui-card-description"
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { slots } = useContext(CardContext);
  return (
    <div
      className={slots?.content({ className })}
      data-slot="heroui-card-content"
      {...props}
    />
  );
}

export { CardContent as CardBody };

export function CardFooter({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { slots } = useContext(CardContext);
  return (
    <div
      className={slots?.footer({ className })}
      data-slot="heroui-card-footer"
      {...props}
    />
  );
}
