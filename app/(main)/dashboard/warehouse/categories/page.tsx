import { getInventoryCategories, getSession, getOrphanedItemCount } from "../actions";
import { InventoryClient } from "../inventory-client";
import { WarehouseWidgetsContainer } from "./widgets-container";
import { WarehouseWidgetsSkeleton } from "../warehouse-widgets";
import { Suspense } from "react";

export const metadata = {
    title: "Категории | Склад",
};

export const dynamic = "force-dynamic";



export default async function WarehouseCategoriesPage() {
    const session = await getSession();

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Suspense fallback={<WarehouseWidgetsSkeleton />}>
                <WarehouseWidgetsContainer />
            </Suspense>

            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--crm-grid-gap)]">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="crm-card flex flex-col p-0 overflow-hidden bg-white shadow-sm border border-slate-100 animate-pulse">
                            {/* Header skeleton */}
                            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-[14px] bg-slate-100 shrink-0" />
                                    <div className="space-y-2">
                                        <div className="h-5 w-24 bg-slate-100 rounded" />
                                        <div className="h-4 w-16 bg-slate-50 rounded" />
                                    </div>
                                </div>
                            </div>
                            {/* Body skeleton */}
                            <div className="flex-1 p-5 pt-4 space-y-4">
                                <div className="space-y-2">
                                    <div className="h-2 w-1/3 bg-slate-100 rounded" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="h-10 bg-slate-50 rounded-[10px]" />
                                        <div className="h-10 bg-slate-50 rounded-[10px]" />
                                    </div>
                                </div>
                            </div>
                            {/* Footer skeleton */}
                            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="h-2 w-28 bg-slate-100 rounded" />
                                <div className="w-7 h-7 rounded-full bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            }>
                <InventoryListContainer session={session} />
            </Suspense>
        </div>
    );
}

import { Category } from "../types";
import { Session } from "@/lib/auth";

async function InventoryListContainer({ session }: { session: Session | null }) {
    const [categoriesResult, orphanedResult] = await Promise.all([
        getInventoryCategories(),
        getOrphanedItemCount()
    ]);

    const categoriesRes = 'data' in categoriesResult && categoriesResult.data ? categoriesResult.data : [];
    const orphanedCount = 'count' in orphanedResult && typeof orphanedResult.count === 'number' ? orphanedResult.count : 0;

    const desiredOrder = ["Одежда", "Упаковка", "Расходники", "Без категории"];
    const categories: Category[] = [...categoriesRes];

    if (orphanedCount > 0) {
        categories.push({
            id: "orphaned",
            name: "Без категории",
            itemCount: orphanedCount,
            description: "Позиции без привязки к категории",
            color: "slate",
            icon: "box",
            isSystem: true
        });
    }

    const sortedCategories = categories.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.name);
        const indexB = desiredOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <InventoryClient
            categories={sortedCategories}
            user={session}
        />
    );
}
