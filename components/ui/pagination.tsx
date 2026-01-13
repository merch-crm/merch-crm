"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
    totalItems: number;
    pageSize?: number;
    currentPage?: number;
    itemName?: string;
}

export function Pagination({
    totalItems,
    pageSize = 20,
    currentPage,
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
        router.push(createPageURL(newPage));
    };

    if (totalItems === 0) return null;

    return (
        <div className="relative flex flex-col md:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="text-sm text-slate-500 w-full md:w-auto text-center md:text-left order-2 md:order-1">
                Показано {Math.min((page - 1) * pageSize + 1, totalItems)}-
                {Math.min(page * pageSize, totalItems)} из {totalItems} {itemName}
            </div>

            <div className="flex-1 flex justify-center order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(1)}
                        disabled={page === 1}
                    >
                        <span className="sr-only">Первая страница</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        <span className="sr-only">Предыдущая страница</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap px-2">
                        Страница {page} из {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        <span className="sr-only">Следующая страница</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page === totalPages}
                    >
                        <span className="sr-only">Последняя страница</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Empty div to balance justify-between if needed, or just let the absolute centering work */}
            <div className="hidden md:block w-auto order-3" />
        </div>
    );
}
