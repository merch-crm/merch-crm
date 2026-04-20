"use client";

import { cn } from"@/lib/utils";


interface RoleBadgeProps {
    roleName?: string;
    className?: string;
}

const roleConfig: Record<string, string> = {
  "Администратор": "bg-primary/5 text-primary ring-1 ring-primary/20",
  "Управляющий": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Отдел продаж": "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  "Дизайнер": "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  "Печатник": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Монтажник": "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
};

export function RoleBadge({ roleName, className }: RoleBadgeProps) {
    if (!roleName) return null;

    const style = roleConfig[roleName] ||"bg-slate-50 text-slate-700 ring-1 ring-slate-100";

    return (
        <span className={cn("badge-base px-2.5 py-0.5 w-fit",
            style,
            className
        )}>
            {roleName}
        </span>
    );
}
