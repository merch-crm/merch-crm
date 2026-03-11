"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    href?: string;
    linkText?: string;
    action?: React.ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    description,
    href,
    linkText = "Все",
    action,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {href && (
                <Link
                    href={href}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    {linkText}
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}
