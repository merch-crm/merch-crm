"use client";

import { Toolbar as AriaToolbar, type ToolbarProps as AriaToolbarProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps } from "../../utils/compose";

const toolbar = tv({
  base: "flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-1 shadow-sm",
});

export interface ToolbarProps extends AriaToolbarProps {}

export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <AriaToolbar
      data-slot="heroui-toolbar"
      className={composeTailwindRenderProps(className, toolbar())}
      {...props}
    />
  );
}
