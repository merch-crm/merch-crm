"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  Button as ButtonPrimitive,
  Popover as PopoverPrimitive,
  Select as SelectPrimitive,
  SelectValue as SelectValuePrimitive,
  type SelectProps as SelectPrimitiveProps,
  type ButtonProps as ButtonPrimitiveProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeSlotClassName, composeTwRenderProps } from "../../utils/compose";
import { ChevronDown } from "lucide-react";

const selectVariants = tv({
  slots: {
    base: "group flex flex-col gap-1.5",
    trigger:
      "flex h-10 w-full items-center justify-between rounded-2xl border border-border bg-white px-3 text-sm outline-none transition-colors hover:bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:h-9",
    value: "flex-1 truncate text-left text-foreground placeholder:text-muted-foreground",
    indicator:
      "ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180",
    popover:
      "z-50 w-[var(--trigger-width)] overflow-hidden rounded-xl border border-border bg-white shadow-lg animate-in fade-in-0 zoom-in-95",
  },
  variants: {
    variant: {
      default: {},
      filled: {
        trigger: "border-transparent bg-slate-100 hover:bg-slate-200 focus:bg-white focus:border-primary",
      },
    },
    fullWidth: {
      true: { base: "w-full" },
    },
  },
  defaultVariants: { variant: "default" },
});

type SelectVariants = VariantProps<typeof selectVariants>;

const SelectContext = createContext<{
  slots?: ReturnType<typeof selectVariants>;
}>({});

export interface SelectProps<T extends object> extends Omit<SelectPrimitiveProps<T>, "children">, SelectVariants {
  children?: SelectPrimitiveProps<T>["children"];
}

export function Select<T extends object>({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: SelectProps<T>) {
  const slots = useMemo(
    () => selectVariants({ fullWidth, variant }),
    [fullWidth, variant]
  );

  return (
    <SelectContext value={{ slots }}>
      <SelectPrimitive
        data-slot="heroui-select"
        {...props}
        className={composeTwRenderProps(className, slots.base())}
      >
        {(values) =>
          typeof children === "function" ? children(values) : children
        }
      </SelectPrimitive>
    </SelectContext>
  );
}

export function SelectTrigger({
  children,
  className,
  ...props
}: ButtonPrimitiveProps) {
  const { slots } = useContext(SelectContext);
  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, slots?.trigger())}
      data-slot="heroui-select-trigger"
      {...props}
    >
      {(values) =>
        typeof children === "function" ? children(values) : children
      }
    </ButtonPrimitive>
  );
}

export function SelectValue({
  className,
  ...props
}: ComponentPropsWithRef<typeof SelectValuePrimitive>) {
  const { slots } = useContext(SelectContext);
  return (
    <SelectValuePrimitive
      className={composeTwRenderProps(className, slots?.value())}
      data-slot="heroui-select-value"
      {...props}
    />
  );
}

export function SelectIndicator({
  className,
  ...props
}: ComponentPropsWithRef<"svg">) {
  const { slots } = useContext(SelectContext);
  return (
    <ChevronDown
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="heroui-select-indicator"
      {...props}
    />
  );
}

export function SelectPopover({
  children,
  className,
  placement = "bottom",
  ...props
}: Omit<ComponentPropsWithRef<typeof PopoverPrimitive>, "children"> & {
  children: ReactNode;
}) {
  const { slots } = useContext(SelectContext);
  return (
    <PopoverPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.popover())}
      placement={placement}
    >
      {children}
    </PopoverPrimitive>
  );
}
