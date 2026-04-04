"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { composeTailwindRenderProps, composeTailwindClassName } from "../../utils/compose";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

const pagination = tv({
  base: "mx-auto flex w-full justify-center",
});

const paginationContent = tv({
  base: "flex flex-row items-center gap-1",
});

const paginationItem = tv({
  base: "",
});

const paginationLink = tv({
  base: "inline-flex items-center justify-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:bg-transparent disabled:opacity-40",
  variants: {
    isActive: {
      true: "border-border bg-background shadow-sm",
    },
    size: {
      default: "h-9 w-9 p-0",
      sm: "h-8 w-8 text-xs p-0",
      lg: "h-10 w-10 p-0",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="heroui-pagination"
      className={composeTailwindClassName(className as string, pagination())}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={paginationContent({ className })} {...props} />;
}

export function PaginationItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={paginationItem({ className })} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & AriaLinkProps & VariantProps<typeof paginationLink>;

export function PaginationLink({ className, isActive, size, ...props }: PaginationLinkProps) {
  return (
    <AriaLink
      data-slot="heroui-pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={composeTailwindRenderProps(className, paginationLink({ isActive, size }))}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={composeTailwindClassName(className as string, "gap-1 pl-2.5")}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Назад</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={composeTailwindClassName(className as string, "gap-1 pr-2.5")}
      {...props}
    >
      <span>Вперед</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={composeTailwindClassName(className as string, "flex h-9 w-9 items-center justify-center")}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
