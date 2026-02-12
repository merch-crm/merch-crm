"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";


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
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
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
                    <Button
                        variant="ghost"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-nav h-10 w-auto px-3 bg-transparent hover:bg-transparent"
                    >
                        <ChevronLeft />
                        <span>Назад</span>
                    </Button>

                    <div className="flex items-center gap-1">
                        {getPages().map((page, idx) => (
                            <React.Fragment key={idx}>
                                {typeof page === "number" ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handlePageChange(page)}
                                        className={cn(
                                            "pagination-item h-9 w-9 p-0 bg-transparent hover:bg-transparent",
                                            currentPage === page && "active"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                ) : (
                                    <div className="pagination-ellipsis">
                                        <MoreHorizontal />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-nav h-10 w-auto px-3 bg-transparent hover:bg-transparent"
                    >
                        <span>Вперёд</span>
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </div>
    );
}
