"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ElementType;
    onClick?: () => void;
    isEllipsis?: boolean;
    isLast?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
    showHome?: boolean;
    homeHref?: string;
}

export function Breadcrumbs({
    items = [],
    className,
    showHome = true,
    homeHref = "/dashboard",
}: BreadcrumbsProps) {
    const safeItems = Array.isArray(items) ? items : [];
    const isMobile = useMediaQuery("(max-width: 1023px)");

    // Handle mobile truncation automatically if items > 2
    // We only truncate if none of the items are already marked as ellipsis
    const hasEllipsis = safeItems.some(i => i.isEllipsis);
    const shouldTruncate = isMobile && safeItems.length > 2 && !hasEllipsis;

    const displayItems = shouldTruncate
        ? [
            { label: "...", isEllipsis: true, href: "#" },
            safeItems[safeItems.length - 2],
            safeItems[safeItems.length - 1]
        ]
        : safeItems;

    if (safeItems.length === 0 && !showHome) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(
                "flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2 duration-500",
                className
            )}
        >
            {showHome && (
                <>
                    <Link
                        href={homeHref}
                        className="text-slate-400 hover:text-primary transition-all hover:scale-125 active:scale-90 flex-shrink-0"
                    >
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    {(safeItems.length > 0) && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                </>
            )}

            {(displayItems || []).map((item, index) => {
                const isLast = index === displayItems.length - 1;
                const Icon = item.icon;

                return (
                    <div key={index} className="flex items-center gap-2 min-w-0">
                        {index > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        )}

                        {item.isEllipsis ? (
                            <span className="text-[12px] font-bold text-slate-400 opacity-60 flex-shrink-0">...</span>
                        ) : (
                            <>
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight text-slate-400 hover:text-primary transition-all hover:scale-[1.05] active:scale-95 truncate group"
                                    >
                                        {Icon && <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                ) : item.onClick && !isLast ? (
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight text-slate-400 hover:text-primary transition-all hover:scale-[1.05] active:scale-95 truncate group"
                                    >
                                        {Icon && <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                ) : (
                                    <span
                                        className={cn(
                                            "flex items-center gap-1.5 text-[12px] font-bold tracking-tight transition-all truncate",
                                            isLast ? "text-slate-900" : "text-slate-400"
                                        )}
                                        aria-current={isLast ? "page" : undefined}
                                    >
                                        {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
