import { getInventoryCategories, getInventoryItems, getInventoryHistory, getStorageLocations, getAllUsers, getInventoryAttributes, getArchivedItems } from "./actions";
import { getSession } from "@/lib/auth";
// Auto-deploy trigger v1.1 - Restarting...
import { WarehouseClient } from "./warehouse-client";
import { InventoryItem } from "./types";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
    const { data: categoriesFromDb = [] } = await getInventoryCategories();
    const { data: items = [] } = await getInventoryItems();
    const { data: history = [] } = await getInventoryHistory();
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

    const { data: attributeTypes = [] } = await getInventoryAttributeTypes();

    if (categoriesFromDb.length === 0 || categoriesFromDb.some(c => ["Футболки", "Кепки"].includes(c.name) && !c.parentId)) {
        await seedSystemCategories();
    }

    if (attributes.length === 0) {
        await seedSystemAttributes();
    }

    const session = await getSession();
    const { data: archivedItemsResponse = [] } = await getArchivedItems();

    const desiredOrder = ["Одежда", "Упаковка", "Расходники", "Без категории"];
    const categories = [...categoriesFromDb].sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.name);
        const indexB = desiredOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // CRITICAL SYNC: Ensure item quantity is always the sum of its stocks across all locations
    // This fixes the discrepancy between the T-shirt total and the warehouse card counts
    const finalItems = items.map(item => {
        const totalFromStocks = item.stocks?.reduce((sum: number, s) => sum + s.quantity, 0) ?? 0;
        const stocksExist = item.stocks && item.stocks.length > 0;

        return {
            ...item,
            // If the item has multi-location stocks, use their sum. Otherwise, use legacy quantity.
            quantity: stocksExist ? totalFromStocks : item.quantity,
            attributes: (item.attributes as Record<string, string | number | boolean | null>) || {},
        };
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <WarehouseClient
                items={finalItems as InventoryItem[]}
                archivedItems={archivedItemsResponse as InventoryItem[]}
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
