"use client";

import { cn } from "@/lib/utils";


interface RoleBadgeProps {
    roleName?: string;
    className?: string;
}

const roleConfig: Record<string, string> = {
    "Администратор": "badge-role-admin",
    "Управляющий": "badge-role-manager",
    "Отдел продаж": "badge-role-sales",
    "Дизайнер": "badge-role-designer",
    "Печатник": "badge-role-printer",
    "Монтажник": "badge-base bg-slate-50 text-slate-700 ring-1 ring-slate-100",
};

export function RoleBadge({ roleName, className }: RoleBadgeProps) {
    if (!roleName) return null;

    const style = roleConfig[roleName] || "bg-slate-50 text-slate-700 ring-1 ring-slate-100";

    return (
        <span className={cn(
            "badge-base px-2.5 py-0.5 w-fit",
            style,
            className
        )}>
            {roleName}
        </span>
    );
}
