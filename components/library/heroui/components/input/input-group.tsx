"use client";

import { tv } from "tailwind-variants";

const inputGroup = tv({
  base: "relative flex w-full flex-col gap-1.5",
});

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="heroui-input-group"
      className={inputGroup({ className })}
      {...props}
    />
  );
}
