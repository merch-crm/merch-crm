import { notFound } from "next/navigation";
import {
    getInventoryItem,
    getStorageLocations,
    getMeasurementUnits,
    getInventoryCategories,
    getInventoryAttributeTypes,
    getInventoryAttributes
} from "../../actions";
import { ItemDetailClient } from "./item-detail-client";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: itemId } = await params;

    const [itemRes, locationsRes, categoriesRes, typesRes, attrsRes] = await Promise.all([
        getInventoryItem(itemId),
        getStorageLocations(),
        getInventoryCategories(),
        getInventoryAttributeTypes(),
        getInventoryAttributes()
    ]);

    if (itemRes.error || !itemRes.data) {
        notFound();
    }

    // Process dates for serialization
    const processedItem = JSON.parse(JSON.stringify(itemRes.data));
    const processedLocations = JSON.parse(JSON.stringify(locationsRes.data || []));
    const processedCategories = JSON.parse(JSON.stringify(categoriesRes.data || []));
    const processedAttributeTypes = JSON.parse(JSON.stringify(typesRes.data || []));
    const processedAttributes = JSON.parse(JSON.stringify(attrsRes.data || []));


    return (
        <div className="p-1">
            <ItemDetailClient
                item={processedItem}
                storageLocations={processedLocations}
                categories={processedCategories}
                attributeTypes={processedAttributeTypes}
                allAttributes={processedAttributes}
            />
        </div>
    );
}
