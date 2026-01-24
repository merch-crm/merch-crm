import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ElementType;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <div className={cn("flex items-center gap-2 text-[12px] font-bold text-slate-400 tracking-tight pl-1 flex-wrap", className)}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                // Helper to render content with icon
                const content = (
                    <>
                        {item.icon && <item.icon className="w-3 h-3 mb-0.5" />}
                        <span className={cn(isLast && "line-clamp-1 break-all")}>{item.label}</span>
                    </>
                );

                const itemClasses = cn(
                    "flex items-center gap-1 transition-colors",
                    !isLast && (item.href || item.onClick)
                        ? "hover:text-#5d00ff cursor-pointer"
                        : "text-slate-500"
                );

                let Component: React.ReactNode;

                if (!isLast && item.href) {
                    Component = (
                        <Link href={item.href} className={itemClasses}>
                            {content}
                        </Link>
                    );
                } else if (!isLast && item.onClick) {
                    Component = (
                        <button onClick={item.onClick} className={itemClasses} type="button">
                            {content}
                        </button>
                    );
                } else {
                    Component = (
                        <span className={itemClasses}>
                            {content}
                        </span>
                    );
                }

                return (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="text-slate-300 select-none">/</span>}
                        {Component}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
