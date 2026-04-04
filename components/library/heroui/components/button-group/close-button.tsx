"use client";

import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { X } from "lucide-react";
import { composeTailwindRenderProps } from "../../utils/compose";

const closeButton = tv({
  base: "relative flex h-8 w-8 items-center justify-center rounded-md border-transparent bg-transparent p-0 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:bg-transparent disabled:opacity-40",
});

export interface CloseButtonProps extends AriaButtonProps {}

export function CloseButton({ className, ...props }: CloseButtonProps) {
  return (
    <AriaButton
      data-slot="heroui-close-button"
      className={composeTailwindRenderProps(className, closeButton())}
      {...props}
    >
      <X size={16} />
      <span className="sr-only">Close</span>
    </AriaButton>
  );
}
