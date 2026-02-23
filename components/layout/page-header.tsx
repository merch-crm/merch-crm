import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-row items-center justify-between gap-3 px-0 min-h-[40px] sm:min-h-[44px]", className)}>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {title}
                </h1>
                {description && (
                    <p className="text-slate-500 text-[12px] sm:text-[13px] font-medium mt-0 sm:mt-1.5 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
