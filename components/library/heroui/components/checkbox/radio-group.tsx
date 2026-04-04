"use client";

import {
  RadioGroup as AriaRadioGroup,
  Radio as AriaRadio,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";
import { composeTailwindRenderProps } from "../../utils/compose";

const radioGroup = tv({
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

const radio = tv({
  base: "group flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  slots: {
    indicator: "h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors group-data-[selected]:bg-primary group-data-[selected]:border-primary",
  },
});

export interface RadioGroupProps extends AriaRadioGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function RadioGroup({ label, description, errorMessage, orientation = "vertical", className, ...props }: RadioGroupProps) {
  const slots = radioGroup({ orientation });
  return (
    <AriaRadioGroup
      data-slot="heroui-radiogroup"
      className={composeTailwindRenderProps(className, slots.container())}
      orientation={orientation as "horizontal" | "vertical"}
      {...props}
    >
      {(values) => (
        <>
          {label && <Label>{label}</Label>}
          <div className={slots.list()}>
            {typeof props.children === 'function' ? props.children(values) : props.children}
          </div>
          {description && <Description>{description}</Description>}
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </AriaRadioGroup>
  );
}

export interface RadioProps extends AriaRadioProps {}

export function Radio({ className, children, ...props }: RadioProps) {
  const slots = radio();
  return (
    <AriaRadio
      data-slot="heroui-radio"
      className={composeTailwindRenderProps(className, slots.base())}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <div className={slots.indicator()}>
            {isSelected && <div className="m-auto h-2 w-2 rounded-full bg-background" />}
          </div>
          {children}
        </>
      )}
    </AriaRadio>
  );
}
