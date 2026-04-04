"use client";

import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

import { composeTailwindRenderProps } from "../../utils/compose";

const textarea = tv({
  slots: {
    container: "flex flex-col gap-1.5 w-full",
    input: "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  },
});

export interface TextareaProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
}

export function Textarea({ label, description, errorMessage, placeholder, className, ...props }: TextareaProps) {
  const slots = textarea();
  return (
    <AriaTextField
      data-slot="heroui-textarea"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <AriaTextArea
        className={slots.input()}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
