"use client";

import { createContext, useContext, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  TabList as TabListPrimitive,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
  SelectionIndicator as SelectionIndicatorPrimitive,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import {
  composeTwRenderProps,
  composeTailwindRenderProps,
} from "../../utils/compose";

const tabsVariants = tv({
  slots: {
    base: "flex flex-col gap-2",
    tabListContainer: "relative",
    tabList:
      "relative inline-flex items-center gap-0 rounded-2xl bg-slate-100 p-1",
    tab: "relative z-10 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground data-[selected]:text-foreground",
    tabIndicator:
      "absolute rounded-xl bg-white shadow-sm transition-all duration-200",
    tabPanel:
      "mt-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:rounded-xl",
    separator: "",
  },
  variants: {
    variant: {
      solid: {},
      underlined: {
        tabList: "rounded-none bg-transparent border-b border-border p-0",
        tab: "rounded-none px-4 py-2 data-[selected]:text-primary",
        tabIndicator:
          "rounded-none shadow-none h-0.5 bg-primary bottom-0",
      },
      bordered: {
        tabList: "bg-transparent border border-border",
      },
    },
  },
  defaultVariants: { variant: "solid" },
});

type TabsVariants = VariantProps<typeof tabsVariants>;
type TabsContext = {
  orientation?: "horizontal" | "vertical";
  slots?: ReturnType<typeof tabsVariants>;
};

const TabsContext = createContext<TabsContext>({});

export interface TabsProps
  extends ComponentPropsWithRef<typeof TabsPrimitive>,
    TabsVariants {
  children: ReactNode;
}

export function Tabs({
  children,
  className,
  orientation = "horizontal",
  variant,
  ...props
}: TabsProps) {
  const slots = useMemo(() => tabsVariants({ variant }), [variant]);

  return (
    <TabsContext value={{ orientation, slots }}>
      <TabsPrimitive
        {...props}
        className={composeTwRenderProps(className, slots.base())}
        data-slot="heroui-tabs"
        orientation={orientation}
      >
        {children}
      </TabsPrimitive>
    </TabsContext>
  );
}

export function TabList({
  children,
  className,
  ...props
}: ComponentPropsWithRef<typeof TabListPrimitive<object>> & {
  children: ReactNode;
}) {
  const { slots } = useContext(TabsContext);
  return (
    <TabListPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.tabList())}
      data-slot="heroui-tabs-list"
    >
      {children}
    </TabListPrimitive>
  );
}

export function Tab({
  children,
  className,
  ...props
}: ComponentPropsWithRef<typeof TabPrimitive>) {
  const { slots } = useContext(TabsContext);
  return (
    <TabPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.tab())}
      data-slot="heroui-tab"
    >
      {children}
    </TabPrimitive>
  );
}

export function TabIndicator({
  className,
  ...props
}: ComponentPropsWithRef<typeof SelectionIndicatorPrimitive>) {
  const { slots } = useContext(TabsContext);
  return (
    <SelectionIndicatorPrimitive
      className={composeTailwindRenderProps(className, slots?.tabIndicator())}
      data-slot="heroui-tab-indicator"
      {...props}
    />
  );
}

export function TabPanel({
  children,
  className,
  ...props
}: Omit<ComponentPropsWithRef<typeof TabPanelPrimitive>, "children"> & {
  children: ReactNode;
}) {
  const { slots } = useContext(TabsContext);
  return (
    <TabPanelPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.tabPanel())}
      data-slot="heroui-tab-panel"
    >
      {children}
    </TabPanelPrimitive>
  );
}
