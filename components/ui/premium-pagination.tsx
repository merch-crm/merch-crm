"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pluralize } from "@/lib/pluralize";

interface PremiumPaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
    className?: string;
    itemName?: string;
    itemNames?: [string, string, string];
}

export function PremiumPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    className,
    itemName = "позиций",
    itemNames
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

    const displayItemName = itemNames
        ? pluralize(totalItems, itemNames[0], itemNames[1], itemNames[2])
        : itemName;

    if (totalPages <= 1) return null;

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

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4", className)}>
            <div className="text-[13px] font-bold text-slate-400 whitespace-nowrap pl-2">
                Показано {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} из {totalItems} {displayItemName}
            </div>

            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="crm-filter-tray">
                    {getPages().map((page, idx) => (
                        <React.Fragment key={idx}>
                            {typeof page === "number" ? (
                                <button
                                    onClick={() => handlePageChange(page)}
                                    className={cn(
                                        "w-9 h-9 rounded-[10px] text-[13px] font-black transition-all active:scale-90",
                                        currentPage === page
                                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                            : "text-slate-400 hover:text-slate-900 hover:bg-white"
                                    )}
                                >
                                    {page}
                                </button>
                            ) : (
                                <div className="w-9 h-9 flex items-center justify-center text-slate-300">
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
