"use client";

import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Column as AriaColumn,
  Row as AriaRow,
  Cell as AriaCell,
  type TableProps as AriaTableProps,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableBodyProps as AriaTableBodyProps,
  type ColumnProps as AriaColumnProps,
  type RowProps as AriaRowProps,
  type CellProps as AriaCellProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindClassName, composeTailwindRenderProps } from "../../utils/compose";

const table = tv({
  base: "w-full caption-bottom text-sm border-collapse",
});

const tableHeader = tv({
  base: "[&_tr]:border-b",
});

const tableBody = tv({
  base: "[&_tr:last-child]:border-0",
});

const tableRow = tv({
  base: "border-b border-border transition-colors hover:bg-muted/50 data-[selected]:bg-muted",
});

const tableColumn = tv({
  base: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
});

const tableCell = tv({
  base: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
});

export interface TableProps extends AriaTableProps {}

export function Table({ className, ...props }: TableProps) {
  return (
    <AriaTable
      data-slot="heroui-table"
      className={composeTailwindRenderProps(className, table())}
      {...props}
    />
  );
}

export function TableScrollContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="heroui-table-scroll-container"
      className={composeTailwindClassName(className, "relative w-full overflow-auto rounded-lg border border-border")}
      {...props}
    />
  );
}

export interface TableContentProps extends React.HTMLAttributes<HTMLTableElement> {}

export function TableContent({ className, ...props }: TableContentProps) {
    return <table className={composeTailwindClassName(className, "w-full overflow-hidden text-sm")} {...props} />
}

export interface TableHeaderProps<T extends object> extends AriaTableHeaderProps<T> {}

export function TableHeader<T extends object>({ className, ...props }: TableHeaderProps<T>) {
  return (
    <AriaTableHeader
      data-slot="heroui-table-header"
      className={composeTailwindRenderProps(className, tableHeader())}
      {...props}
    />
  );
}

export interface TableBodyProps<T extends object> extends AriaTableBodyProps<T> {}

export function TableBody<T extends object>({ className, ...props }: TableBodyProps<T>) {
  return (
    <AriaTableBody
      data-slot="heroui-table-body"
      className={composeTailwindRenderProps(className, tableBody())}
      {...props}
    />
  );
}

export interface TableColumnProps extends AriaColumnProps {}

export function TableColumn({ className, ...props }: TableColumnProps) {
  return (
    <AriaColumn
      data-slot="heroui-table-column"
      className={composeTailwindRenderProps(className, tableColumn())}
      {...props}
    />
  );
}

export interface TableRowProps<T extends object> extends AriaRowProps<T> {}

export function TableRow<T extends object>({ className, ...props }: TableRowProps<T>) {
  return (
    <AriaRow
      data-slot="heroui-table-row"
      className={composeTailwindRenderProps(className, tableRow())}
      {...props}
    />
  );
}

export interface TableCellProps extends AriaCellProps {}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <AriaCell
      data-slot="heroui-table-cell"
      className={composeTailwindRenderProps(className, tableCell())}
      {...props}
    />
  );
}
