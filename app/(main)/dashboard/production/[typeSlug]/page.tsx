import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductionHeader } from "../components/production-header";
import { ProductionBoard, type OrderItem } from "../production-board";
import { ProductionWidgets } from "../production-widgets";
import { getApplicationTypeBySlug } from "../actions/application-type-actions";
import { getProductionBoardItems, getProductionTypeStats } from "../actions/production-dashboard-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductionTypePageProps {
    params: Promise<{
        typeSlug: string;
    }>;
}

export async function generateMetadata({ params }: ProductionTypePageProps) {
    const { typeSlug } = await params;
    const result = await getApplicationTypeBySlug(typeSlug);

    if (!result.success || !result.data) {
        return { title: "Производство | Merch CRM" };
    }

    return {
        title: `${result.data.name} | Производство`,
        description: `Заказы на ${result.data.name.toLowerCase()}`,
    };
}

function BoardSkeleton() {
    return (
        <div className="p-6 space-y-3">
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

export default async function ProductionTypePage({ params }: ProductionTypePageProps) {
    const { typeSlug } = await params;
    const result = await getApplicationTypeBySlug(typeSlug);

    if (!result.success || !result.data) {
        notFound();
    }

    const applicationType = result.data;
    const [boardItemsResult, statsResult] = await Promise.all([
        getProductionBoardItems(applicationType.id),
        getProductionTypeStats(applicationType.id)
    ]);
    const boardItems = boardItemsResult.success ? boardItemsResult.data || [] : [];
    const stats = statsResult.success ? statsResult.data : { active: 0, urgent: 0, efficiency: 0, completedToday: 0 };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Tabs Header */}
            <ProductionHeader activeSlug={typeSlug} />

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <Suspense fallback={<BoardSkeleton />}>
                    <div className="p-6 space-y-3">
                        {/* Type Badge */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: (applicationType.color as string) || undefined }}
                            />
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">{applicationType.name}</h2>
                            {applicationType.description && (
                                <span className="text-sm font-medium text-slate-500">
                                    — {applicationType.description}
                                </span>
                            )}
                        </div>

                        {/* Widgets */}
                        <ProductionWidgets stats={stats!} />

                        {/* Board */}
                        <ProductionBoard items={boardItems as unknown as OrderItem[]} />
                    </div>
                </Suspense>
            </div>
        </div>
    );
}
