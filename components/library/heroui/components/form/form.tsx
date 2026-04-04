"use client";

import {
  Form as AriaForm,
  type FormProps as AriaFormProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindClassName } from "../../utils/compose";

const form = tv({
  base: "space-y-3",
});

export interface FormProps extends AriaFormProps {}

export function Form({ className, ...props }: FormProps) {
  return (
    <AriaForm
      data-slot="heroui-form"
      className={composeTailwindClassName(className as string, form())}
      {...props}
    />
  );
}

const fieldset = tv({
  base: "space-y-3 rounded-lg border border-border p-4",
});

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label?: string;
}

export function Fieldset({ label, className, children, ...props }: FieldsetProps) {
  return (
    <fieldset
      data-slot="heroui-fieldset"
      className={fieldset({ className })}
      {...props}
    >
      {label && <legend className="px-1 text-sm font-semibold">{label}</legend>}
      {children}
    </fieldset>
  );
}
