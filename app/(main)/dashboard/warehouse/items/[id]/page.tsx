import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { Metadata } from "next";
import {
    getInventoryItem,
    getStorageLocations,
    getInventoryCategories,
    getInventoryAttributeTypes,
    getInventoryAttributes
} from "../../actions";
import { ItemDetailClient } from "./item-detail-client";
import { getSession } from "@/lib/auth";
import { serializeForClient } from "@/lib/serialize";
import { InventoryItem, StorageLocation, Category, AttributeType, InventoryAttribute } from "../../types";

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
     * Используем приведение к 'any', так как ItemDetailClient ожидает оригинальные интерфейсы (InventoryItem и т.д.),
     * в которых даты могут быть как Date, так и string.
     */
    const item = serializeForClient(itemRes.data) as any;
    const locations = serializeForClient('data' in locationsRes && locationsRes.data ? locationsRes.data : []) as any;
    const categories = serializeForClient('data' in categoriesRes && categoriesRes.data ? categoriesRes.data : []) as any;
    const attributeTypes = serializeForClient('data' in typesRes && typesRes.data ? typesRes.data : []) as any;
    const attributes = serializeForClient('data' in attrsRes && attrsRes.data ? attrsRes.data : []) as any;

    return (
        <div className="p-4">
            <ItemDetailClient
                item={item}
                storageLocations={locations}
                categories={categories}
                attributeTypes={attributeTypes}
                allAttributes={attributes}
                user={session}
            />
        </div>
    );
}
