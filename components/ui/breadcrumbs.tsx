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
        <nav aria-label="Навигация" className={className}>
            <ol className="flex items-center gap-2 text-[12px] font-bold text-slate-400 tracking-tight pl-1 flex-wrap">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isClickable = !isLast && (item.href || item.onClick);
                    const Icon = item.icon;

                    const content = (
                        <>
                            {Icon && <Icon className="w-3 h-3 mb-0.5" />}
                            <span className={cn(isLast && "line-clamp-1 break-all")}>
                                {item.label}
                            </span>
                        </>
                    );

                    const itemClasses = cn(
                        "flex items-center gap-1 transition-colors",
                        isClickable && "hover:text-primary cursor-pointer",
                        isLast ? "text-slate-500" : "text-slate-400"
                    );

                    const renderItem = () => {
                        if (!isLast && item.href) {
                            return (
                                <Link href={item.href} className={itemClasses}>
                                    {content}
                                </Link>
                            );
                        }

                        if (!isLast && item.onClick) {
                            return (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className={itemClasses}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <span className={itemClasses} aria-current={isLast ? "page" : undefined}>
                                {content}
                            </span>
                        );
                    };

                    return (
                        <li
                            key={item.href || item.label || index}
                            className="flex items-center gap-2"
                        >
                            {index > 0 && (
                                <span
                                    className="text-slate-300 select-none"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                            )}
                            {renderItem()}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
