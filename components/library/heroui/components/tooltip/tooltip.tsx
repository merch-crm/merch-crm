"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  Focusable as FocusablePrimitive,
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import {
  composeSlotClassName,
  composeTwRenderProps,
} from "../../utils/compose";

const tooltipVariants = tv({
  slots: {
    base: "z-50 rounded-xl border border-border bg-white px-3 py-1.5 text-sm text-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
    trigger: "outline-none",
  },
});

const TooltipContext = createContext<{
  slots?: ReturnType<typeof tooltipVariants>;
}>({});

export function Tooltip({
  children,
  ...props
}: ComponentPropsWithRef<typeof TooltipTriggerPrimitive>) {
  const slots = useMemo(() => tooltipVariants(), []);

  return (
    <TooltipContext value={{ slots }}>
      <TooltipTriggerPrimitive data-slot="heroui-tooltip" {...props}>
        {children}
      </TooltipTriggerPrimitive>
    </TooltipContext>
  );
}

export interface TooltipContentProps
  extends Omit<ComponentPropsWithRef<typeof TooltipPrimitive>, "children"> {
  showArrow?: boolean;
  children: ReactNode;
}

export function TooltipContent({
  children,
  className,
  offset: offsetProp,
  showArrow = false,
  ...props
}: TooltipContentProps) {
  const { slots } = useContext(TooltipContext);
  const offset = offsetProp ?? (showArrow ? 7 : 3);

  return (
    <TooltipPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.base())}
      offset={offset}
    >
      {showArrow && (
        <OverlayArrow>
          <svg data-slot="overlay-arrow" height={8} viewBox="0 0 8 8" width={8}>
            <path d="M0 0 Q4 6 8 0" fill="white" stroke="var(--border)" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </TooltipPrimitive>
  );
}

export function TooltipTrigger({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { slots } = useContext(TooltipContext);
  return (
    <FocusablePrimitive>
      <div
        className={composeSlotClassName(slots?.trigger, className)}
        data-slot="heroui-tooltip-trigger"
        role="button"
        {...props}
      >
        {children}
      </div>
    </FocusablePrimitive>
  );
}
