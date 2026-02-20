import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { Metadata } from "next";
import { getInventoryItem } from "../../item-actions";
import { getStorageLocations } from "../../storage-actions";
import { getInventoryCategories } from "../../category-actions";
import { getInventoryAttributeTypes, getInventoryAttributes } from "../../attribute-actions";;
import { ItemDetailClient } from "./item-detail-client";
import { getSession } from "@/lib/auth";
import { serializeForClient, type Serialized } from "@/lib/serialize";
import type { InventoryItem, StorageLocation, Category, AttributeType, InventoryAttribute } from "../../types";

type PageParams = {
    params: Promise<{ id: string }>;
};

// Кэшируем запрос для дедупликации между generateMetadata и основным рендером страницы
const getCachedItem = cache(async (id: string) => {
    return getInventoryItem(id);
});

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { id } = await params;
    const itemRes = await getCachedItem(id);

    if ('data' in itemRes && itemRes.data) {
        return { title: `${itemRes.data.name} | Склад` };
    }

    return { title: "Товар | Склад" };
}

export default async function ItemPage({ params }: PageParams) {
    const { id } = await params;

    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const [itemRes, locationsRes, categoriesRes, typesRes, attrsRes] = await Promise.all([
        getCachedItem(id),
        getStorageLocations(),
        getInventoryCategories(),
        getInventoryAttributeTypes(),
        getInventoryAttributes()
    ]);

    if ('error' in itemRes || !itemRes.data) {
        notFound();
    }

    // Логируем ошибки вспомогательных запросов, но не блокируем отображение страницы
    if ('error' in locationsRes) console.error("Failed to load locations:", locationsRes.error);
    if ('error' in categoriesRes) console.error("Failed to load categories:", categoriesRes.error);
    if ('error' in typesRes) console.error("Failed to load attribute types:", typesRes.error);
    if ('error' in attrsRes) console.error("Failed to load attributes:", attrsRes.error);

    /**
     * Сериализуем данные для клиента.
     */
    const item = serializeForClient(itemRes.data) as Serialized<InventoryItem>;
    const locations = serializeForClient('data' in locationsRes && locationsRes.data ? locationsRes.data : []) as Serialized<StorageLocation[]>;
    const categories = serializeForClient('data' in categoriesRes && categoriesRes.data ? categoriesRes.data : []) as Serialized<Category[]>;
    const attributeTypes = serializeForClient('data' in typesRes && typesRes.data ? typesRes.data : []) as Serialized<AttributeType[]>;
    const attributes = serializeForClient('data' in attrsRes && attrsRes.data ? attrsRes.data : []) as Serialized<InventoryAttribute[]>;

    return (
        <div className="p-1">
            <ItemDetailClient
                item={item as InventoryItem}
                storageLocations={locations as StorageLocation[]}
                categories={categories as Category[]}
                attributeTypes={attributeTypes as AttributeType[]}
                allAttributes={attributes as InventoryAttribute[]}
                user={session}
            />
        </div>
    );
}
