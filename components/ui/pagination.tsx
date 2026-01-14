"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";


interface PaginationProps {
    totalItems: number;
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    itemName?: string;
}

export function Pagination({
    totalItems,
    pageSize = 20,
    currentPage,
    onPageChange,
    itemName = "items"
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
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            router.push(createPageURL(newPage));
        }
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="text-[13px] text-slate-400 font-medium whitespace-nowrap">
                Показано {Math.min((page - 1) * pageSize + 1, totalItems)}-
                {Math.min(page * pageSize, totalItems)} из {totalItems} {itemName}
            </div>

            <div className="flex items-center space-x-1">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center justify-center text-[12px] font-bold text-slate-900 px-2 min-w-[100px] text-center">
                    {page} / {totalPages}
                </div>

                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                >
                    <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
