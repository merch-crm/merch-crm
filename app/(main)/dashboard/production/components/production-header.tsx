import { Suspense } from "react";
import { TypeTabs } from "./type-tabs";
import { getApplicationTypes, type ApplicationType } from "../actions/application-type-actions";
import { getProductionOrdersCounts } from "../actions/task-stats-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductionHeaderProps {
    activeSlug?: string;
}

async function TypeTabsWrapper({ activeSlug }: { activeSlug?: string }) {
    const [typesResult, countsResult] = await Promise.all([
        getApplicationTypes({ activeOnly: true }),
        getProductionOrdersCounts(),
    ]);

    if (!typesResult.success) {
        return null;
    }

    const types = typesResult.data || [];
    const counts = countsResult.success && countsResult.data ? countsResult.data : {};

    // Добавляем счётчики к типам
    const typesWithCounts = types.map((type: ApplicationType) => ({
        ...type,
        orderCount: counts[type.id] || 0,
    }));

    const totalOrdersCount = Object.values(counts).reduce((sum: number, count: unknown) => sum + ((count as number) || 0), 0);

    return (
        <TypeTabs
            types={typesWithCounts}
            activeSlug={activeSlug}
            totalOrdersCount={totalOrdersCount}
        />
    );
}

function TabsSkeleton() {
    return (
        <div className="border-b px-4 py-2 bg-background/95">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <div className="w-px h-6 bg-border mx-2" />
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
        </div>
    );
}

export function ProductionHeader({ activeSlug }: ProductionHeaderProps) {
    return (
        <Suspense fallback={<TabsSkeleton />}>
            <TypeTabsWrapper activeSlug={activeSlug} />
        </Suspense>
    );
}
