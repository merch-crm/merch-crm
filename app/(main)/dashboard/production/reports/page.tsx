import { Suspense } from "react";
import { Metadata } from "next";
import { ReportsPageClient } from "./reports-page-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Отчёты | Производство",
    description: "Аналитические отчёты по производству",
};

export const dynamic = "force-dynamic";

/**
 * Скелетон для страницы отчётов (соответствует сетке контента)
 */
function ReportsSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
            <Skeleton className="h-96" />
        </div>
    );
}

/**
 * Серверная страница отчётов производства
 */
export default function ReportsPage() {
    return (
        <Suspense fallback={<ReportsSkeleton />}>
            <ReportsPageClient />
        </Suspense>
    );
}
