"use client";

import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

const switchGroup = tv({
  slots: {
    container: "flex flex-col gap-2",
    list: "flex flex-col gap-2",
  },
  variants: {
    orientation: {
        horizontal: { list: "flex-row gap-3" },
        vertical: { list: "flex-col gap-2" },
    }
  }
});

export interface SwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  errorMessage?: string;
  orientation?: "horizontal" | "vertical";
}

export function SwitchGroup({ label, description, errorMessage, orientation = "vertical", className, ...props }: SwitchGroupProps) {
  const slots = switchGroup({ orientation });
  return (
    <div
      data-slot="heroui-switchgroup"
      className={slots.container({ className })}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <div className={slots.list()}>{props.children}</div>
      {description && <Description>{description}</Description>}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </div>
  );
}
