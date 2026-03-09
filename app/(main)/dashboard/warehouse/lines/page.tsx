import { Suspense } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LinesPageClient } from "./lines-page-client";
import { getAllLines } from "./actions";
import { getInventoryCategories } from "../category-actions";

export const metadata = { title: "Склад | Линейки продуктов" };
export const dynamic = "force-dynamic";

export default async function LinesPage() {
    const [linesResult, categoriesResult] = await Promise.all([
        getAllLines(),
        getInventoryCategories(),
    ]);

    const lines = (linesResult.success && linesResult.data) ? linesResult.data : [];
    const categories = (categoriesResult.success && categoriesResult.data) ? categoriesResult.data : [];

    return (
        <PageContainer>
            <PageHeader
                title="Линейки продуктов"
                description="Базовые и готовые линейки для всех категорий"
            />
            <Suspense fallback={<LinesSkeleton />}>
                <LinesPageClient lines={lines} categories={categories} />
            </Suspense>
        </PageContainer>
    );
}

function LinesSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
        </div>
    );
}
