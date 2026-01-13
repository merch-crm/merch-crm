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
        <div className="relative flex flex-col md:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="text-[13px] text-slate-400 w-full md:w-auto text-center md:text-left order-2 md:order-1 font-medium">
                Показано {Math.min((page - 1) * pageSize + 1, totalItems)}-
                {Math.min(page * pageSize, totalItems)} из {totalItems} {itemName}
            </div>

            <div className="flex-1 flex justify-center order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                        onClick={() => handlePageChange(1)}
                        disabled={page === 1}
                    >
                        <span className="sr-only">Первая страница</span>
                        <ChevronsLeft className="h-4 w-4 stroke-[1.5]" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        <span className="sr-only">Предыдущая страница</span>
                        <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
                    </Button>
                    <div className="flex items-center justify-center text-[13px] font-medium text-slate-900 whitespace-nowrap px-4">
                        Страница {page} из {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        <span className="sr-only">Следующая страница</span>
                        <ChevronRight className="h-4 w-4 stroke-[1.5]" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-full border-slate-200 text-slate-400 hover:text-slate-900 transition-all bg-white"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page === totalPages}
                    >
                        <span className="sr-only">Последняя страница</span>
                        <ChevronsRight className="h-4 w-4 stroke-[1.5]" />
                    </Button>
                </div>
            </div>

            <div className="hidden md:block w-auto order-3" />
        </div>
    );
}
