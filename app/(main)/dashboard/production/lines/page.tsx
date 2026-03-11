import { Suspense } from "react";
import { Metadata } from "next";
import { getProductionLines } from "../actions/line-actions";
import { getApplicationTypes } from "../actions/application-type-actions";
import { LinesPageClient } from "./lines-page-client";

export const metadata: Metadata = {
    title: "Производственные линии | Производство",
    description: "Управление производственными линиями",
};

export const dynamic = "force-dynamic";

export default async function LinesPage() {
    const [linesResult, typesResult] = await Promise.all([
        getProductionLines(),
        getApplicationTypes({ activeOnly: true }),
    ]);

    const lines = linesResult.success ? (linesResult.data || []) : [];
    const applicationTypes = typesResult.success ? (typesResult.data || []) : [];

    return (
        <Suspense fallback={<LinesPageSkeleton />}>
            <LinesPageClient
                initialLines={lines}
                applicationTypes={applicationTypes}
            />
        </Suspense>
    );
}

function LinesPageSkeleton() {
    return (
        <div className="p-6 space-y-3">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        </div>
    );
}
