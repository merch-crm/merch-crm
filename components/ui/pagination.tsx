"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";


interface PaginationProps {
    totalItems: number;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    itemName?: string;
    itemNames?: [string, string, string];
}

export function Pagination({
    totalItems,
    pageSize = 20,
    currentPage,
    onPageChange,
    itemName = "items",
    itemNames
}: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // If currentPage is not provided, read from URL
    const page = currentPage || Number(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(totalItems / pageSize);

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            router.push(createPageURL(newPage));
        }
    };

    const getPages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (page >= totalPages - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const displayItemName = itemNames
        ? pluralize(totalItems, itemNames[0], itemNames[1], itemNames[2])
        : (itemName || "items");

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="text-[13px] font-bold text-slate-400 whitespace-nowrap pl-2">
                Показано {Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)} из {totalItems} {displayItemName}
            </div>

            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 p-1.5 bg-slate-100/60 rounded-[14px] border border-slate-200/40 shadow-inner">
                    {getPages().map((p, idx) => (
                        <div key={idx}>
                            {typeof p === "number" ? (
                                <button
                                    onClick={() => handlePageChange(p)}
                                    className={cn(
                                        "w-9 h-9 rounded-[10px] text-[13px] font-black transition-all active:scale-90",
                                        page === p
                                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                            : "text-slate-400 hover:text-slate-900 hover:bg-white"
                                    )}
                                >
                                    {p}
                                </button>
                            ) : (
                                <div className="w-9 h-9 flex items-center justify-center text-slate-300">
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
