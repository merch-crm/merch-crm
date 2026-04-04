"use client";

import {
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  type DialogProps as AriaDialogProps,
  type HeadingProps as AriaHeadingProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";

const popover = tv({
  slots: {
    content: "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
    header: "flex flex-col space-y-1 text-center sm:text-left",
    heading: "text-sm font-semibold leading-none ",
    body: "text-sm text-muted-foreground",
    footer: "flex items-center pt-4",
  },
});

export function Popover({ children, ...props }: React.ComponentProps<typeof AriaDialogTrigger>) {
  return <AriaDialogTrigger data-slot="heroui-popover" {...props}>{children}</AriaDialogTrigger>;
}

export { AriaDialogTrigger as PopoverTrigger };

export interface PopoverContentProps extends AriaPopoverProps {}

export function PopoverContent({ children, className, ...props }: PopoverContentProps) {
  const slots = popover();
  return (
    <AriaPopover
      data-slot="heroui-popover-content"
      className={composeTailwindRenderProps(className, slots.content())}
      {...props}
    >
      {children}
    </AriaPopover>
  );
}

export function PopoverDialog({ className, ...props }: AriaDialogProps) {
  return <AriaDialog data-slot="heroui-popover-dialog" className="outline-none" {...props} />;
}

export function PopoverHeading({ className, ...props }: AriaHeadingProps) {
  return <AriaHeading slot="title" className={popover().heading({ className })} {...props} />;
}
