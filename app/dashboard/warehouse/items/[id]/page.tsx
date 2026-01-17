import { notFound } from "next/navigation";
import { getInventoryItem, getStorageLocations, getMeasurementUnits, getInventoryCategories } from "../../actions";
import { ItemDetailClient } from "./item-detail-client";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: itemId } = await params;

    const [itemRes, locationsRes, unitsRes, categoriesRes] = await Promise.all([
        getInventoryItem(itemId),
        getStorageLocations(),
        getMeasurementUnits(),
        getInventoryCategories()
    ]);

    if (itemRes.error || !itemRes.data) {
        notFound();
    }

    // Process dates for serialization
    const processedItem = JSON.parse(JSON.stringify(itemRes.data));
    const processedLocations = JSON.parse(JSON.stringify(locationsRes.data || []));
    const processedUnits = JSON.parse(JSON.stringify(unitsRes.data || []));
    const processedCategories = JSON.parse(JSON.stringify(categoriesRes.data || []));


    return (
        <div className="p-1">
            <ItemDetailClient
                item={processedItem}
                storageLocations={processedLocations}
                measurementUnits={processedUnits}
                categories={processedCategories}
            />
        </div>
    );
}
