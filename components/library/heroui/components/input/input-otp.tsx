"use client";

import { Input as AriaInput, Group, type GroupProps } from "react-aria-components";
import { tv } from "tailwind-variants";

import { composeTailwindRenderProps } from "../../utils/compose";

const inputOtp = tv({
  slots: {
    base: "flex items-center gap-2",
    input: "flex h-10 w-9 items-center justify-center rounded-md border border-input bg-background text-center text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  },
});

export interface InputOtpProps extends GroupProps {
  length?: number;
}

export function InputOtp({ length = 4, className, ...props }: InputOtpProps) {
  const slots = inputOtp();
  return (
    <Group
      data-slot="heroui-input-otp"
      className={composeTailwindRenderProps(className, slots.base())}
      {...props}
    >
      {Array.from({ length }).map((_, i) => (
        <AriaInput
          key={i}
          className={slots.input()}
          maxLength={1}
          inputMode="numeric"
          pattern="\d*"
        />
      ))}
    </Group>
  );
}
