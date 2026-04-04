"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureStateContext,
  type DisclosureGroupProps,
  type DisclosureProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeSlotClassName, composeTwRenderProps } from "../../utils/compose";
import { ChevronDown } from "lucide-react";
import { dataAttr } from "../../utils/assertion";

const accordionVariants = tv({
  slots: {
    base: "flex flex-col",
    item: "group border-b border-border",
    heading: "",
    trigger:
      "flex w-full items-center justify-between py-4 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary [&[data-expanded]]:text-primary",
    indicator:
      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 data-[expanded=true]:rotate-180",
    panel: "overflow-hidden text-sm text-muted-foreground",
    body: "",
    bodyInner: "pb-4",
  },
  variants: {
    variant: {
      default: {},
      bordered: {
        base: "rounded-2xl border border-border",
        item: "px-4 border-b last:border-b-0",
      },
      surface: {
        base: "rounded-2xl bg-white shadow-sm",
        item: "px-4 border-b last:border-b-0",
      },
      splitted: {
        base: "gap-2",
        item: "rounded-2xl border border-border px-4",
      },
    },
  },
  defaultVariants: { variant: "default" },
});

type AccordionVariants = VariantProps<typeof accordionVariants>;

const AccordionContext = createContext<{
  slots?: ReturnType<typeof accordionVariants>;
  hideSeparator?: boolean;
}>({});

export interface AccordionProps
  extends Omit<DisclosureGroupProps, "children">,
    AccordionVariants {
  hideSeparator?: boolean;
  children: DisclosureGroupProps["children"];
}

export function Accordion({
  children,
  className,
  hideSeparator = false,
  variant,
  ...props
}: AccordionProps) {
  const slots = useMemo(() => accordionVariants({ variant }), [variant]);

  return (
    <AccordionContext value={{ slots, hideSeparator }}>
      <DisclosureGroup
        className={composeTwRenderProps(className, slots.base())}
        data-slot="heroui-accordion"
        {...props}
      >
        {(values) =>
          typeof children === "function" ? children(values) : children
        }
      </DisclosureGroup>
    </AccordionContext>
  );
}

export function AccordionItem({
  className,
  children,
  ...props
}: DisclosureProps) {
  const { hideSeparator, slots } = useContext(AccordionContext);
  return (
    <Disclosure
      className={composeTwRenderProps(className, slots?.item())}
      data-hide-separator={hideSeparator ? "true" : undefined}
      data-slot="heroui-accordion-item"
      {...props}
    >
      {(values) =>
        typeof children === "function" ? children(values) : children
      }
    </Disclosure>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  const { slots } = useContext(AccordionContext);
  return (
    <Button
      className={composeTwRenderProps(className, slots?.trigger())}
      data-slot="heroui-accordion-trigger"
      slot="trigger"
      {...props}
    >
      {(values) =>
        typeof children === "function" ? children(values) : children
      }
    </Button>
  );
}

export function AccordionIndicator({
  className,
  ...props
}: ComponentPropsWithRef<"svg">) {
  const { slots } = useContext(AccordionContext);
  const disclosureState = useContext(DisclosureStateContext);
  const isExpanded = disclosureState?.isExpanded;

  return (
    <ChevronDown
      className={composeSlotClassName(slots?.indicator, className)}
      data-expanded={dataAttr(isExpanded)}
      data-slot="heroui-accordion-indicator"
      {...props}
    />
  );
}

export function AccordionPanel({
  children,
  className,
  ...props
}: ComponentPropsWithRef<typeof DisclosurePanel>) {
  const { slots } = useContext(AccordionContext);
  const disclosureState = useContext(DisclosureStateContext);

  return (
    <DisclosurePanel
      className={composeTwRenderProps(className, slots?.panel())}
      data-expanded={dataAttr(disclosureState?.isExpanded)}
      data-slot="heroui-accordion-panel"
      {...props}
    >
      {children}
    </DisclosurePanel>
  );
}

export function AccordionBody({
  children,
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { slots } = useContext(AccordionContext);
  return (
    <div className={slots?.body({})} data-slot="heroui-accordion-body" {...props}>
      <div className={composeSlotClassName(slots?.bodyInner, className)}>
        {children}
      </div>
    </div>
  );
}
