"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
    iconColor?: string;
    iconBgColor?: string;
    className?: string;
}

export function QuickActionCard({
    title,
    description,
    icon: Icon,
    href,
    onClick,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10",
    className,
}: QuickActionCardProps) {
    const content = (
        <div
            role="button"
            tabIndex={0}
            className={cn(
                "crm-card h-full flex flex-col justify-center",
                "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group",
                className
            )}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="flex items-center gap-3">
                <div className={cn("p-4 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110", iconBgColor)}>
                    <Icon className={cn("h-6 w-6", iconColor)} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-[13px] sm:text-sm lg:text-base leading-tight break-words overflow-hidden">
                        {title}
                    </p>
                    {description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block h-full">{content}</Link>;
    }

    return content;
}
