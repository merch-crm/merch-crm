import { Suspense } from "react";
import { Metadata } from "next";
import { getApplicationTypes, getApplicationTypesStats } from "../actions/application-type-actions";
import { ApplicationTypesPageClient } from "./application-types-page-client";

export const metadata: Metadata = {
    title: "Типы нанесения | Производство",
    description: "Управление типами нанесения",
};

export const dynamic = "force-dynamic";

export default async function ApplicationTypesPage() {
    const [typesResult, statsResult] = await Promise.all([
        getApplicationTypes(),
        getApplicationTypesStats(),
    ]);

    const types = typesResult.success ? typesResult.data! : [];
    const stats = statsResult.success ? statsResult.data! : { total: 0, active: 0, byCategory: {} };

    return (
        <Suspense fallback={<ApplicationTypesPageSkeleton />}>
            <ApplicationTypesPageClient
                initialTypes={types}
                stats={stats}
            />
        </Suspense>
    );
}

function ApplicationTypesPageSkeleton() {
    return (
        <div className="space-y-3">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        </div>
    );
}
