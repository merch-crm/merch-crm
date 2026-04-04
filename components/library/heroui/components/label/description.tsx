"use client";

import {
  Text as AriaText,
  type TextProps as AriaTextProps,
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps, composeTailwindClassName } from "../../utils/compose";

const description = tv({
  base: "text-xs text-muted-foreground",
});

const fieldError = tv({
  base: "text-xs font-medium text-danger",
});

export interface DescriptionProps extends AriaTextProps {}

export function Description({ className, ...props }: DescriptionProps) {
  return (
    <AriaText
      slot="description"
      data-slot="heroui-description"
      className={composeTailwindClassName(className as string, description())}
      {...props}
    />
  );
}

export interface FieldErrorProps extends AriaFieldErrorProps {}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError
      data-slot="heroui-field-error"
      className={composeTailwindRenderProps(className, fieldError())}
      {...props}
    />
  );
}
