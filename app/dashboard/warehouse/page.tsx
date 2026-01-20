import { getInventoryCategories, getInventoryItems, getInventoryHistory, getStorageLocations, getAllUsers, getInventoryAttributes } from "./actions";
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
        console.log(`First item: ${history[0].type} for ${history[0].item?.name || 'N/A'}`);
    }
    const { data: storageLocations = [] } = await getStorageLocations();
    const { data: users = [] } = await getAllUsers();
    const { data: attributes = [] } = await getInventoryAttributes();
    const { getMeasurementUnits, seedMeasurementUnits, seedSystemCategories, seedSystemAttributes, getInventoryAttributeTypes } = await import("./actions");
    let { data: measurementUnits = [] } = await getMeasurementUnits();

    if (measurementUnits.length === 0) {
        await seedMeasurementUnits();
        const res = await getMeasurementUnits();
        measurementUnits = res.data || [];
    }

    // Get attribute types (no auto-seeding as function doesn't exist)
    const { data: attributeTypes = [] } = await getInventoryAttributeTypes();

    // Auto-seed system categories if empty or orphans detected or missing linguistic data
    const hasOrphanedSubs = categoriesFromDb.some(c => ["Футболки", "Кепки"].includes(c.name) && !c.parentId);
    const missingLinguistic = categoriesFromDb.some(c => ["Футболка", "Худи", "Свитшот"].includes(c.name) && (!c.singularName || !c.pluralName));

    if (categoriesFromDb.length === 0 || hasOrphanedSubs || missingLinguistic) {
        await seedSystemCategories();
        const { data: refreshedCategories = [] } = await getInventoryCategories();
        categoriesFromDb.splice(0, categoriesFromDb.length, ...refreshedCategories);
    }

    // Auto-seed system attributes if empty
    if (attributes.length === 0) {
        await seedSystemAttributes();
        const { data: refreshedAttrs = [] } = await getInventoryAttributes();
        attributes.splice(0, attributes.length, ...refreshedAttrs);
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
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-slate-900 leading-none">Склад</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Центральный узел логистики
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
                attributes={attributes}
                attributeTypes={attributeTypes}
            />
        </div>
    );
}
