"use client";

import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
  Heading as AriaHeading,
  type ModalOverlayProps as AriaModalOverlayProps,
  type DialogProps as AriaDialogProps,
  type HeadingProps as AriaHeadingProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";

const drawer = tv({
  slots: {
    backdrop: "fixed inset-0 z-50 bg-black/80 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0",
    container: "fixed inset-y-0 z-50 flex h-full w-3/4 flex-col gap-3 border-l border-border bg-background p-6 shadow-lg transition ease-in-out data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:duration-500 data-[exiting]:duration-300 sm:max-w-sm",
    content: "flex flex-col gap-3 h-full",
    header: "flex flex-col space-y-1.5 text-center sm:text-left",
    heading: "text-lg font-semibold leading-none ",
    body: "flex-1 overflow-auto text-sm text-muted-foreground",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  },
  variants: {
    placement: {
      left: {
        container: "left-0 border-r data-[entering]:slide-in-from-left data-[exiting]:slide-out-to-left",
      },
      right: {
        container: "right-0 border-l data-[entering]:slide-in-from-right data-[exiting]:slide-out-to-right",
      },
      top: {
        container: "inset-x-0 top-0 h-auto w-full border-b data-[entering]:slide-in-from-top data-[exiting]:slide-out-to-top",
      },
      bottom: {
        container: "inset-x-0 bottom-0 h-auto w-full border-t data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom",
      },
    },
  },
  defaultVariants: {
    placement: "right",
  },
});

export interface DrawerProps extends AriaModalOverlayProps, VariantProps<typeof drawer> {}

export function Drawer({ placement, children, ...props }: DrawerProps) {
  const slots = drawer({ placement });
  return (
    <AriaModalOverlay
      data-slot="heroui-drawer"
      className={slots.backdrop()}
      {...props}
    >
      <AriaModal className={slots.container()}>{children}</AriaModal>
    </AriaModalOverlay>
  );
}

export { AriaModalOverlay as DrawerBackdrop };

export function DrawerContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof drawer>) {
    const slots = drawer({ placement: props.placement });
    return <div className={slots.content({ className })} {...props}>{children}</div>
}

export function DrawerDialog({ className, ...props }: AriaDialogProps) {
  return <AriaDialog data-slot="heroui-drawer-dialog" className="outline-none h-full flex flex-col" {...props} />;
}

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={drawer().header({ className })} {...props} />;
}

export function DrawerHeading({ className, ...props }: AriaHeadingProps) {
  return <AriaHeading slot="title" className={drawer().heading({ className })} {...props} />;
}

export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={drawer().body({ className })} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={drawer().footer({ className })} {...props} />;
}
