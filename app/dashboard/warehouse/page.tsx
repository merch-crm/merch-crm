import { getInventoryCategories, getInventoryItems, getInventoryHistory, getStorageLocations, getAllUsers } from "./actions";
import { getSession } from "@/lib/auth";
// Auto-deploy trigger v1.1 - Restarting...
import { WarehouseClient } from "./warehouse-client";

export const dynamic = "force-dynamic";
export default async function WarehousePage() {
    const { data: categoriesFromDb = [] } = await getInventoryCategories();
    const { data: items = [] } = await getInventoryItems();
    const { data: history = [] } = await getInventoryHistory();
    console.log(`WarehousePage history count: ${history.length}`);
    if (history.length > 0) {
        console.log(`First item: ${history[0].type} for ${history[0].item.name}`);
    }
    const { data: storageLocations = [] } = await getStorageLocations();
    const { data: users = [] } = await getAllUsers();
    const { getMeasurementUnits, seedMeasurementUnits, seedSystemCategories } = await import("./actions");
    let { data: measurementUnits = [] } = await getMeasurementUnits();

    if (measurementUnits.length === 0) {
        await seedMeasurementUnits();
        const res = await getMeasurementUnits();
        measurementUnits = res.data || [];
    }

    // Auto-seed system categories if missing
    if (categoriesFromDb.length < 11) {
        await seedSystemCategories();
        const { data: refreshedCategories = [] } = await getInventoryCategories();
        categoriesFromDb.splice(0, categoriesFromDb.length, ...refreshedCategories);
    }

    const session = await getSession();

    const desiredOrder = ["Одежда", "Упаковка", "Расходники"];

    const categories = [...categoriesFromDb].sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.name);
        const indexB = desiredOrder.indexOf(b.name);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
    });

    const finalItems = items.map(item => ({
        ...item,
        attributes: (item.attributes as Record<string, string | number | boolean | null>) || {},
    }));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">Складской учёт</h1>
                    <p className="text-[#64748b] text-lg font-normal leading-relaxed">
                        Управление остатками товаров и расходных материалов
                    </p>
                </div>
            </div>

            <WarehouseClient
                items={finalItems as unknown as import("./inventory-client").InventoryItem[]}
                categories={categories}
                history={history}
                storageLocations={storageLocations}
                users={users}

                user={session}
            />
        </div>
    );
}
