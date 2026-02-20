import React from "react";
import { type LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    actions?: React.ReactNode;
}

export function AdminPageHeader({
    title,
    subtitle,
    icon: Icon,
    actions
}: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-[12px] sm:rounded-[18px] flex items-center justify-center border border-primary/10 shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">{title}</h1>
                    {subtitle && (
                        <p className="hidden sm:block text-slate-500 text-[11px] font-medium mt-0.5 truncate">{subtitle}</p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
