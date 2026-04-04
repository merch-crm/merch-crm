"use client";

import { tv } from "tailwind-variants";
import { FolderOpen } from "lucide-react";

const emptyState = tv({
  slots: {
    base: "flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center",
    icon: "mb-4 h-12 w-12 text-muted-foreground/50",
    title: "mb-2 text-xl font-semibold text-foreground",
    description: "mx-auto max-w-sm text-sm text-muted-foreground",
    action: "mt-6",
  },
});

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  const slots = emptyState();
  return (
    <div
      data-slot="heroui-empty-state"
      className={slots.base({ className })}
      {...props}
    >
      {icon || <FolderOpen className={slots.icon()} />}
      {title && <h3 className={slots.title()}>{title}</h3>}
      {description && <p className={slots.description()}>{description}</p>}
      {action && <div className={slots.action()}>{action}</div>}
    </div>
  );
}
