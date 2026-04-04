"use client";

import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  type MenuProps as AriaMenuProps,
  type MenuItemProps as AriaMenuItemProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";

const menu = tv({
  base: "w-full min-w-[200px] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
});

const menuItem = tv({
  base: "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[focused]:bg-accent data-[focused]:text-accent-foreground data-[disabled]:opacity-50",
});

export interface MenuProps<T> extends AriaMenuProps<T> {}

export function Menu<T extends object>({ className, ...props }: MenuProps<T>) {
  return (
    <AriaMenu
      data-slot="heroui-menu"
      className={composeTailwindRenderProps(className, menu())}
      {...props}
    />
  );
}

export function MenuTrigger(props: AriaMenuTriggerProps) {
  return <AriaMenuTrigger data-slot="heroui-menu-trigger" {...props} />;
}

export interface MenuItemProps<T> extends AriaMenuItemProps<T> {}

export function MenuItem<T extends object>({ className, ...props }: MenuItemProps<T>) {
  return (
    <AriaMenuItem
      data-slot="heroui-menu-item"
      className={composeTailwindRenderProps(className, menuItem())}
      {...props}
    />
  );
}

export function MenuPopover({ className, ...props }: AriaPopoverProps) {
    return (
        <AriaPopover
            data-slot="heroui-menu-popover"
            className={composeTailwindRenderProps(className, "w-[200px] rounded-md border border-border bg-popover shadow-md")}
            {...props}
        />
    )
}
