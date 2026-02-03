import { getInventoryCategories, getSession, getOrphanedItemCount } from "../actions";
import { InventoryClient } from "../inventory-client";
import { WarehouseWidgetsContainer } from "./widgets-container";
import { WarehouseWidgetsSkeleton } from "../warehouse-widgets";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

import { Loader2 } from "lucide-react";

export default async function WarehouseCategoriesPage() {
    const session = await getSession();

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Suspense fallback={<WarehouseWidgetsSkeleton />}>
                <WarehouseWidgetsContainer />
            </Suspense>

            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--crm-grid-gap)]">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white border border-slate-200 rounded-[var(--radius-outer)] p-6 flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center animate-pulse" />
                                    <div>
                                        <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-2" />
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 text-slate-200 animate-spin" />
                                            <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="min-h-[3rem] relative z-10">
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                                    <div className="h-2 w-2/3 bg-slate-100 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 mt-auto relative z-10">
                                <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 animate-pulse" />
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

async function InventoryListContainer({ session }: { session: any }) {
    const [
        { data: categoriesRes = [] },
        { count: orphanedCount }
    ] = await Promise.all([
        getInventoryCategories(),
        getOrphanedItemCount()
    ]);

    const desiredOrder = ["Одежда", "Упаковка", "Расходники", "Без категории"];
    const categories = [...categoriesRes];

    if (orphanedCount > 0) {
        categories.push({
            id: "orphaned",
            name: "Без категории",
            itemCount: orphanedCount,
            description: "Позиции без привязки к категории",
            color: "slate",
            icon: "box",
            isSystem: true
        } as any);
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
            items={[]}
            categories={sortedCategories as any}
            user={session}
        />
    );
}
