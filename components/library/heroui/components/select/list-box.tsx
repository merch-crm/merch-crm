"use client";

import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxProps as AriaListBoxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  Collection,
  Header,
  Section,
  type SectionProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";
import { Check } from "lucide-react";

const listBox = tv({
  base: "w-full min-w-[200px] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
});

const listBoxItem = tv({
  base: "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[focused]:bg-accent data-[focused]:text-accent-foreground data-[selected]:bg-accent/50 data-[disabled]:opacity-50",
  variants: {
    hasChild: {
      true: "justify-between",
    },
  },
});

export interface ListBoxProps<T> extends AriaListBoxProps<T> {}

export function ListBox<T extends object>({ className, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox
      data-slot="heroui-listbox"
      className={composeTailwindRenderProps(className, listBox())}
      {...props}
    />
  );
}

export interface ListBoxItemProps<T> extends AriaListBoxItemProps<T> {}

export function ListBoxItem<T extends object>({ className, children, ...props }: ListBoxItemProps<T>) {
  return (
    <AriaListBoxItem
      data-slot="heroui-listbox-item"
      className={composeTailwindRenderProps(className, listBoxItem({ hasChild: !!children }))}
      {...props}
    >
      {(renderProps) => {
        const defaultChildren = typeof children === "function" ? children(renderProps) : children;
        return (
          <>
            {renderProps.isSelected && <Check className="mr-2 h-4 w-4" />}
            {defaultChildren}
          </>
        );
      }}
    </AriaListBoxItem>
  );
}

export interface ListBoxSectionProps<T> extends SectionProps<T> {
  title?: string;
}

export function ListBoxSection<T extends object>({ title, children, ...props }: ListBoxSectionProps<T>) {
  return (
    <Section data-slot="heroui-listbox-section" {...props} className="p-1">
      {title && (
        <Header className="px-2 py-1 text-[11px] font-bold text-muted-foreground">
          {title}
        </Header>
      )}
      <Collection>{children}</Collection>
    </Section>
  );
}
