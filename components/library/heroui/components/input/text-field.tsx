"use client";

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Input as AriaInput,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

import { composeTailwindRenderProps } from "../../utils/compose";

const textField = tv({
  slots: {
    container: "flex flex-col gap-1.5 w-full",
    input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  },
});

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
}

export function TextField({ label, description, errorMessage, placeholder, className, ...props }: TextFieldProps) {
  const slots = textField();
  return (
    <AriaTextField
      data-slot="heroui-textfield"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <AriaInput
        className={slots.input()}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
