"use client";

import * as React from "react";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger" | "success";
  shortcut?: string;
}

export interface ActionMenuProps {
  /**
   * Array of actions or array of arrays (groups)
   */
  items: ActionMenuItem[] | ActionMenuItem[][];
  /**
   * Custom trigger element. Default is a "MoreHorizontal" icon button.
   */
  trigger?: React.ReactNode;
  /**
   * Alignment of the dropdown content
   */
  align?: "start" | "center" | "end";
  /**
   * Offset from the trigger
   */
  sideOffset?: number;
  /**
   * Additional styles for the trigger button
   */
  className?: string;
}

export function ActionMenu({
  items,
  trigger,
  align = "end",
  sideOffset = 8,
  className,
}: ActionMenuProps) {
  // Normalize items to groups
  const groups = Array.isArray(items[0])
    ? (items as ActionMenuItem[][])
    : [items as ActionMenuItem[]];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="solid"
            color="black"
            size="icon"
            className={cn("size-11 rounded-2xl shadow-sm active:scale-95", className)}
          >
            <MoreHorizontal className="size-5 text-white" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={sideOffset}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {group.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={itemIndex}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    item.variant === "danger" && "text-rose-600 focus:text-rose-600 focus:bg-rose-50/50",
                    item.variant === "success" && "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50/50"
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
