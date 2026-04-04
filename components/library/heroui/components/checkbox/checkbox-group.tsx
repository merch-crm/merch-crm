"use client";

import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

const checkboxGroup = tv({
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

import { composeTailwindRenderProps } from "../../utils/compose";

export interface CheckboxGroupProps extends AriaCheckboxGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  orientation?: "horizontal" | "vertical";
}

export function CheckboxGroup({ label, description, errorMessage, orientation = "vertical", className, ...props }: CheckboxGroupProps) {
  const slots = checkboxGroup({ orientation });
  return (
    <AriaCheckboxGroup
      data-slot="heroui-checkboxgroup"
      className={composeTailwindRenderProps(className, slots.container())}
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
    </AriaCheckboxGroup>
  );
}
