"use client";

import { cn } from "@/lib/utils";
import {
    ShieldCheck,
    Users,
    Banknote,
    Palette,
    Wrench,
    Printer,
    User
} from "lucide-react";

interface RoleBadgeProps {
    roleName?: string;
    className?: string;
}

const roleConfig: Record<string, string> = {
    "Администратор": "bg-red-50 text-red-700 ring-1 ring-red-100",
    "Управляющий": "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    "Отдел продаж": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    "Дизайнер": "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
    "Печатник": "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
    "Монтажник": "bg-slate-50 text-slate-700 ring-1 ring-slate-100",
};

export function RoleBadge({ roleName, className }: RoleBadgeProps) {
    if (!roleName) return null;

    const style = roleConfig[roleName] || "bg-slate-50 text-slate-700 ring-1 ring-slate-100";

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors w-fit",
            style,
            className
        )}>
            {roleName}
        </span>
    );
}
