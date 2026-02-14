"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";


interface PremiumPaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
    className?: string;
    itemName?: string;
    itemNames?: [string, string, string];
    variant?: "default" | "light";
}

export function PremiumPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    className,
    itemName = "позиций",
    itemNames,
}: PremiumPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        if (onPageChange) {
            onPageChange(page);
        } else {
            const params = new URLSearchParams(searchParams);
            params.set("page", page.toString());
            router.push(`${pathname}?${params.toString()}`);
        }
    };



    const getPages = () => {
        // If total pages is 7 or less, show all numbers
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // Window range (current - 1 to current + 1)
        const windowStart = Math.max(2, currentPage - 1);
        const windowEnd = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis before window if window starts after page 2
        // This covers the case "When on page 4, hide page 2" (window starts at 3, gap 2 hidden)
        if (windowStart > 2) {
            pages.push("...");
        } else if (windowStart === 2) {
            // Case where window starts at 2, so no gap (current page is 3)
            // We just let the loop handle adding 2.
        }

        // Add window pages
        for (let i = windowStart; i <= windowEnd; i++) {
            pages.push(i);
        }

        // Add ellipsis after window if window ends before second to last page
        if (windowEnd < totalPages - 1) {
            pages.push("...");
        }

        // Always show last page if > 1
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    // For the "X out of Y" part, we need genitive case: "из 1 позиции", "из 5 позиций"
    // In our [one, few, many] array, 'few' is usually Genitive Singular and 'many' is Genitive Plural
    const genitiveItemName = itemNames
        ? (totalItems % 10 === 1 && totalItems % 100 !== 11 ? itemNames[1] : itemNames[2])
        : itemName;

    return (
        <div className={cn("pagination pagination-with-info", className)}>
            <div className="pagination-info">
                Показано <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong> - <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> из <strong>{totalItems}</strong> {genitiveItemName}
            </div>


            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Пред
                    </button>

                    <div className="flex items-center gap-1">
                        {getPages().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                                disabled={typeof page !== 'number'}
                                className={cn(
                                    page === "..." ? "pagination-ellipsis" : "pagination-item",
                                    page === currentPage && "active"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="pagination-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        След
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
