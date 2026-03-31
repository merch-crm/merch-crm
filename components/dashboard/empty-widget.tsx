"use client";

import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyWidgetProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    className?: string;
}

export function EmptyWidget({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: EmptyWidgetProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-10 text-center",
                "border-[1.5px] border-dashed border-gray-200 bg-gray-50/50 rounded-3xl",
                className
            )}
        >
            <div className="p-4 rounded-full bg-white shadow-sm ring-1 ring-gray-100 mb-5">
                <Icon className="h-7 w-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-gray-900">{title}</p>
            {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {action && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-6 rounded-xl"
                    onClick={action.onClick}
                    asChild={!!action.href}
                >
                    {action.href ? (
                        <a href={action.href}>{action.label}</a>
                    ) : (
                        action.label
                    )}
                </Button>
            )}
        </div>
    );
}
