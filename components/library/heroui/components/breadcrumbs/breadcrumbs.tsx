"use client";

import {
  Breadcrumbs as AriaBreadcrumbs,
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
  type BreadcrumbProps as AriaBreadcrumbProps,
  Link as AriaLink,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { ChevronRight } from "lucide-react";
import { composeTwRenderProps } from "../../utils/compose";

const breadcrumbs = tv({
  base: "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
});

const breadcrumb = tv({
  base: "inline-flex items-center gap-1.5 sm:gap-2.5",
});

const breadcrumbLink = tv({
  base: "transition-colors hover:text-foreground data-[focused]:text-foreground data-[current]:pointer-events-none data-[current]:text-foreground",
});

export interface BreadcrumbsProps<T extends object> extends AriaBreadcrumbsProps<T> {}

export function Breadcrumbs<T extends object>({ className, children, ...props }: BreadcrumbsProps<T>) {
  return (
    <AriaBreadcrumbs
      data-slot="heroui-breadcrumbs"
      className={composeTwRenderProps(className, breadcrumbs()) as string}
      {...props}
    >
      {children}
    </AriaBreadcrumbs>
  );
}

export interface BreadcrumbProps extends AriaBreadcrumbProps {
  href?: string;
}

export function BreadcrumbItem({ children, href, className, ...props }: BreadcrumbProps) {
  return (
    <AriaBreadcrumb
      data-slot="heroui-breadcrumb-item"
      className={composeTwRenderProps(className, breadcrumb()) as string}
      {...props}
    >
      <AriaLink
        href={href}
        className={composeTwRenderProps(className, breadcrumbLink()) as string}
      >
        {children}
      </AriaLink>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </AriaBreadcrumb>
  );
}

// Named export as BreadcrumbsItem for consistency with HeroUI
export { BreadcrumbItem as BreadcrumbsItem };
