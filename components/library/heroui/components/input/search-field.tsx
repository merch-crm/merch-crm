"use client";

import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  Button as AriaButton,
  Input as AriaInput,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Search, X } from "lucide-react";
import { Label } from "../label/label";
import { Description, FieldError } from "../label/description";

import { composeTailwindRenderProps } from "../../utils/compose";

const searchField = tv({
  slots: {
    container: "flex flex-col gap-1.5",
    group: "relative flex items-center overflow-hidden rounded-md border border-input shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
    searchIcon: "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
    input: "flex-1 border-0 bg-transparent py-2 pl-9 pr-8 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    clearButton: "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[focused]:bg-accent data-[pressed]:bg-accent/80 disabled:opacity-40",
  },
});

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function SearchField({ label, description, errorMessage, className, ...props }: SearchFieldProps) {
  const slots = searchField();
  return (
    <AriaSearchField
      data-slot="heroui-search-field"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <div className={slots.group()}>
        <Search className={slots.searchIcon()} size={16} />
        <AriaInput className={slots.input()} placeholder="Поиск..." />
        <AriaButton slot="clear" className={slots.clearButton()}>
          <X size={14} />
        </AriaButton>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
