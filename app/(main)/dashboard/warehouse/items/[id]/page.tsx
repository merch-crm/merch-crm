import { notFound } from "next/navigation";
import {
    getInventoryItem,
    getStorageLocations,
    getInventoryCategories,
    getInventoryAttributeTypes,
    getInventoryAttributes
} from "../../actions";
import { ItemDetailClient } from "./item-detail-client";

import { getSession } from "@/lib/auth";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: itemId } = await params;
    const session = await getSession();

    const [itemRes, locationsRes, categoriesRes, typesRes, attrsRes] = await Promise.all([
        getInventoryItem(itemId),
        getStorageLocations(),
        getInventoryCategories(),
        getInventoryAttributeTypes(),
        getInventoryAttributes()
    ]);

    if ('error' in itemRes || !itemRes.data) {
        notFound();
    }

    // Process dates for serialization
    const processedItem = JSON.parse(JSON.stringify(itemRes.data));
    const processedLocations = JSON.parse(JSON.stringify(('data' in locationsRes && locationsRes.data) || []));
    const processedCategories = JSON.parse(JSON.stringify(('data' in categoriesRes && categoriesRes.data) || []));
    const processedAttributeTypes = JSON.parse(JSON.stringify(('data' in typesRes && typesRes.data) || []));
    const processedAttributes = JSON.parse(JSON.stringify(('data' in attrsRes && attrsRes.data) || []));


    return (
        <div className="p-1">
            <ItemDetailClient
                item={processedItem}
                storageLocations={processedLocations}
                categories={processedCategories}
                attributeTypes={processedAttributeTypes}
                allAttributes={processedAttributes}
                user={session}
            />
        </div>
    );
}
