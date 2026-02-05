"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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
    variant = "light"
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
        <div className={cn("flex flex-col items-center justify-center p-2 gap-2", className)}>
            <div className="text-[11px] font-bold text-slate-400/80 whitespace-nowrap uppercase tracking-wider">
                Показано {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} из {totalItems} {genitiveItemName}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className={cn(
                        variant === "light" ? "crm-filter-tray-light" : "crm-filter-tray",
                        "!rounded-full p-0.5 !bg-white"
                    )}>
                        {getPages().map((page, idx) => (
                            <React.Fragment key={idx}>
                                {typeof page === "number" ? (
                                    <button
                                        onClick={() => handlePageChange(page)}
                                        className={cn(
                                            "w-8 h-8 rounded-full text-[11px] font-black transition-all active:scale-90 flex items-center justify-center",
                                            currentPage === page
                                                ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                                                : "text-slate-500/80 hover:text-slate-950 hover:bg-white/50"
                                        )}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <div className="w-8 h-8 flex items-center justify-center text-slate-400">
                                        <MoreHorizontal className="w-3 h-3" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
