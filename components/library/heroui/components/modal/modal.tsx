"use client";

import React, { createContext, useContext, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";
import { tv, cx, type VariantProps } from "tailwind-variants";
import {
  Dialog as DialogPrimitive,
  Heading as HeadingPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
  DialogTrigger as ModalTriggerPrimitive,
  type ModalOverlayProps,
} from "react-aria-components";
import { composeSlotClassName, composeTwRenderProps } from "../../utils/compose";

const modalVariants = tv({
  slots: {
    trigger: "outline-none",
    backdrop:
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[entering]:animate-in data-[entering]:fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0",
    container:
      "fixed inset-0 z-50 flex items-center justify-center p-4 data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
    dialog:
      "relative w-full max-h-[85vh] overflow-auto rounded-[var(--radius-outer)] bg-white p-0 shadow-xl outline-none",
    header: "flex flex-col gap-1 px-6 pt-6",
    heading: "text-lg font-semibold text-foreground",
    body: "px-6 py-4",
    footer: "flex items-center justify-end gap-2 px-6 pb-6",
    closeTrigger:
      "absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors",
    icon: "mb-2",
  },
  variants: {
    size: {
      sm: { dialog: "max-w-sm" },
      md: { dialog: "max-w-md" },
      lg: { dialog: "max-w-lg" },
      xl: { dialog: "max-w-xl" },
      "2xl": { dialog: "max-w-2xl" },
      full: { dialog: "max-w-[95vw] h-[95vh]" },
    },
    variant: {
      default: {},
      opaque: { backdrop: "bg-black/80" },
      blur: { backdrop: "bg-black/30 backdrop-blur-md" },
    },
    scroll: {
      inside: { dialog: "overflow-y-auto" },
      outside: { container: "overflow-y-auto", dialog: "overflow-visible" },
    },
  },
  defaultVariants: { size: "md", variant: "default", scroll: "inside" },
});

type ModalVariants = VariantProps<typeof modalVariants>;
type ModalSlots = ReturnType<typeof modalVariants>;

const ModalContext = createContext<{
  slots?: ModalSlots;
}>({});

export function Modal({
  children,
  ...props
}: ComponentPropsWithRef<typeof ModalTriggerPrimitive>) {
  const slots = useMemo(() => modalVariants(), []);
  return (
    <ModalContext value={{ slots }}>
      <ModalTriggerPrimitive data-slot="heroui-modal" {...props}>
        {children}
      </ModalTriggerPrimitive>
    </ModalContext>
  );
}

export interface ModalBackdropProps
  extends Omit<ModalOverlayProps, "children"> {
  variant?: ModalVariants["variant"];
  isDismissable?: boolean;
  children?: ModalOverlayProps["children"];
}

export function ModalBackdrop({
  children,
  className,
  isDismissable = true,
  variant,
  ...props
}: ModalBackdropProps) {
  const { slots: contextSlots } = useContext(ModalContext);
  const updatedSlots = useMemo(() => modalVariants({ variant }), [variant]);

  return (
    <ModalOverlayPrimitive
      className={composeTwRenderProps(className, updatedSlots?.backdrop())}
      data-slot="heroui-modal-backdrop"
      isDismissable={isDismissable}
      {...props}
    >
      {(values) => (
        <ModalContext value={{ slots: { ...contextSlots, ...updatedSlots } }}>
          {typeof children === "function" ? children(values) : children}
        </ModalContext>
      )}
    </ModalOverlayPrimitive>
  );
}

export interface ModalContainerProps
  extends Omit<ModalOverlayProps, "children"> {
  size?: ModalVariants["size"];
  scroll?: ModalVariants["scroll"];
  children?: ModalOverlayProps["children"];
}

export function ModalContainer({
  children,
  className,
  scroll,
  size,
  ...props
}: ModalContainerProps) {
  const { slots: contextSlots } = useContext(ModalContext);
  const updatedSlots = useMemo(
    () => modalVariants({ scroll, size }),
    [scroll, size]
  );

  return (
    <ModalPrimitive
      className={composeTwRenderProps(className, updatedSlots?.container())}
      data-slot="heroui-modal-container"
      {...props}
    >
      {(values) => (
        <ModalContext value={{ slots: { ...contextSlots, ...updatedSlots } }}>
          {typeof children === "function" ? children(values) : children}
        </ModalContext>
      )}
    </ModalPrimitive>
  );
}

export function ModalDialog({
  children,
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive> & { children: ReactNode }) {
  const { slots } = useContext(ModalContext);
  return (
    <DialogPrimitive
      className={cx(slots?.dialog(), typeof className === "string" ? className : undefined)}
      data-slot="heroui-modal-dialog"
      {...props}
    >
      {children}
    </DialogPrimitive>
  );
}

export function ModalHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { slots } = useContext(ModalContext);
  return (
    <div className={composeSlotClassName(slots?.header, className)} data-slot="heroui-modal-header" {...props} />
  );
}

export function ModalHeading({
  children,
  className,
  ...props
}: ComponentPropsWithRef<typeof HeadingPrimitive>) {
  const { slots } = useContext(ModalContext);
  return (
    <HeadingPrimitive
      className={composeSlotClassName(slots?.heading, className)}
      data-slot="heroui-modal-heading"
      slot="title"
      {...props}
    >
      {children}
    </HeadingPrimitive>
  );
}

export function ModalBody({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { slots } = useContext(ModalContext);
  return (
    <div className={composeSlotClassName(slots?.body, className)} data-slot="heroui-modal-body" {...props} />
  );
}

export function ModalFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { slots } = useContext(ModalContext);
  return (
    <div className={composeSlotClassName(slots?.footer, className)} data-slot="heroui-modal-footer" {...props} />
  );
}
