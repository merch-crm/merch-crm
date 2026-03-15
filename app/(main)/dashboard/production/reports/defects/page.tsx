// app/(main)/dashboard/production/reports/defects/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { DefectsReportClient } from "./defects-report-client";
import { getDefectsByCategory } from "../../actions/defect-actions";

export const metadata: Metadata = {
    title: "Отчёт по браку | Производство",
    description: "Детальная статистика брака по категориям и периодам",
};

export const dynamic = "force-dynamic";

export default async function DefectsReportPage() {
    const defectsResult = await getDefectsByCategory("week");
    const defects = defectsResult.success ? defectsResult.data : [];
    const total = defectsResult.success ? defectsResult.total : 0;

    return (
        <Suspense fallback={<DefectsReportSkeleton />}>
            <DefectsReportClient
                initialData={defects ?? []}
                initialTotal={total ?? 0}
            />
        </Suspense>
    );
}

function DefectsReportSkeleton() {
    return (
        <div className="space-y-3 p-6">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
                ))}
            </div>
            <div className="h-72 bg-muted animate-pulse rounded-xl" />
        </div>
    );
}
