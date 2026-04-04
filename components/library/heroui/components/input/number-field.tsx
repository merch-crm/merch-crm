"use client";

import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Button as AriaButton,
  Input as AriaInput,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

import { composeTailwindRenderProps } from "../../utils/compose";

const numberField = tv({
  slots: {
    container: "flex flex-col gap-1.5",
    group: "relative flex items-center overflow-hidden rounded-md border border-input shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
    input: "flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    stepper: "flex flex-col border-l border-input",
    stepButton: "flex h-5 w-8 items-center justify-center p-0 text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground data-[focused]:bg-accent data-[pressed]:bg-accent/80 disabled:opacity-40",
  },
});

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function NumberField({ label, description, errorMessage, className, ...props }: NumberFieldProps) {
  const slots = numberField();
  return (
    <AriaNumberField
      data-slot="heroui-number-field"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <div className={slots.group()}>
        <AriaInput className={slots.input()} />
        <div className={slots.stepper()}>
          <AriaButton slot="increment" className={slots.stepButton()}>
            <ChevronUp size={12} />
          </AriaButton>
          <AriaButton slot="decrement" className={slots.stepButton({ className: "border-t border-input" })}>
            <ChevronDown size={12} />
          </AriaButton>
        </div>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
