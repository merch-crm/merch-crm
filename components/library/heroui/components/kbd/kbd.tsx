"use client";

import { tv } from "tailwind-variants";

const kbd = tv({
  base: "inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground opacity-100",
});

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="heroui-kbd"
      className={kbd({ className })}
      {...props}
    />
  );
}
