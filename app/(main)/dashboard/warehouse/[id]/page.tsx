import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { CategoryDetailClient, Category, InventoryItem } from "./category-detail-client";
import { StorageLocation } from "../storage-locations-tab";
import { getSession } from "@/lib/auth";
import { serializeForClient } from "@/lib/serialize";
import { cache } from "react";

type PageParams = {
    params: Promise<{ id: string }>;
};

// Дедупликация запроса категории
const getCachedCategory = cache(async (id: string, isUuid: boolean) => {
    const query = db
        .select({
            id: inventoryCategories.id,
            name: inventoryCategories.name,
            description: inventoryCategories.description,
            icon: inventoryCategories.icon,
            color: inventoryCategories.color,
            prefix: inventoryCategories.prefix,
            parentId: inventoryCategories.parentId,
            sortOrder: inventoryCategories.sortOrder,
            isActive: inventoryCategories.isActive,
            isSystem: inventoryCategories.isSystem,
            gender: inventoryCategories.gender,
            singularName: inventoryCategories.singularName,
            pluralName: inventoryCategories.pluralName,
            createdAt: inventoryCategories.createdAt,
            slug: inventoryCategories.slug,
            fullPath: inventoryCategories.fullPath,
        })
        .from(inventoryCategories);

    if (isUuid) {
        query.where(eq(inventoryCategories.id, id));
    } else {
        query.where(eq(inventoryCategories.slug, id));
    }

    const [found] = await query.limit(1);
    return found;
});

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { id: paramId } = await params;
    if (paramId === "orphaned") return { title: "Без категории | Склад" };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);
    const found = await getCachedCategory(paramId, isUuid);

    return { title: found ? `${found.name} | Склад` : "Категория | Склад" };
}

export default async function CategoryPage({ params }: PageParams) {
    const { id: paramId } = await params;

    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Fetch category info and its parent if exists
    let category = null;
    let parentCategory = null;
    let resolvedCategoryId: string | null = null;

    if (paramId === "orphaned") {
        resolvedCategoryId = null; // orphaned
    } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);
        category = await getCachedCategory(paramId, isUuid);

        if (!category) {
            notFound();
        }

        resolvedCategoryId = category.id;

        if (category.parentId) {
            const [parent] = await db
                .select({
                    id: inventoryCategories.id,
                    name: inventoryCategories.name,
                    description: inventoryCategories.description,
                    icon: inventoryCategories.icon,
                    color: inventoryCategories.color,
                    prefix: inventoryCategories.prefix,
                    parentId: inventoryCategories.parentId,
                    sortOrder: inventoryCategories.sortOrder,
                    isActive: inventoryCategories.isActive,
                    isSystem: inventoryCategories.isSystem,
                    gender: inventoryCategories.gender,
                    singularName: inventoryCategories.singularName,
                    pluralName: inventoryCategories.pluralName,
                    createdAt: inventoryCategories.createdAt,
                    slug: inventoryCategories.slug,
                    fullPath: inventoryCategories.fullPath,
                })
                .from(inventoryCategories)
                .where(eq(inventoryCategories.id, category.parentId))
                .limit(1);
            parentCategory = parent;
        }
    }

    // Fetch subcategories for this category
    const subCategoriesRaw = resolvedCategoryId
        ? await db
            .select({
                id: inventoryCategories.id,
                name: inventoryCategories.name,
                description: inventoryCategories.description,
                icon: inventoryCategories.icon,
                color: inventoryCategories.color,
                prefix: inventoryCategories.prefix,
                parentId: inventoryCategories.parentId,
                sortOrder: inventoryCategories.sortOrder,
                isActive: inventoryCategories.isActive,
                isSystem: inventoryCategories.isSystem,
                gender: inventoryCategories.gender,
                singularName: inventoryCategories.singularName,
                pluralName: inventoryCategories.pluralName,
                createdAt: inventoryCategories.createdAt,
                slug: inventoryCategories.slug,
                fullPath: inventoryCategories.fullPath,
            })
            .from(inventoryCategories)
            .where(eq(inventoryCategories.parentId, resolvedCategoryId))
        : [];

    // Fetch items
    const { getInventoryItems, getStorageLocations, getInventoryAttributeTypes, getInventoryAttributes } = await import("../actions");

    const [itemsRes, locationsRes, typesRes, attrsRes, allCategoriesRaw] = await Promise.all([
        getInventoryItems(),
        getStorageLocations(),
        getInventoryAttributeTypes(),
        getInventoryAttributes(),
        db.select({ id: inventoryCategories.id, parentId: inventoryCategories.parentId }).from(inventoryCategories)
    ]);

    const allItems = itemsRes.data || [];

    // Aggregate IDs of this category and all its descendants
    const getAllDescendantIds = (catId: string, allCats: { id: string; parentId: string | null }[]): string[] => {
        const ids = [catId];
        const children = allCats.filter(c => c.parentId === catId);
        for (const child of children) {
            ids.push(...getAllDescendantIds(child.id, allCats));
        }
        return ids;
    };

    const targetCategoryIds: (string | null)[] = resolvedCategoryId
        ? getAllDescendantIds(resolvedCategoryId, allCategoriesRaw)
        : [null];

    const categoryItems = allItems.filter(item =>
        resolvedCategoryId
            ? targetCategoryIds.includes(item.categoryId)
            : !item.categoryId
    );

    // Унифицированная сериализация всех данных
    const subCategories = serializeForClient(subCategoriesRaw) as any;
    const items = serializeForClient(categoryItems) as any;
    const locations = serializeForClient(locationsRes.data || []) as any;
    const attributeTypes = serializeForClient(typesRes.data || []) as any;
    const allAttributes = serializeForClient(attrsRes.data || []) as any;

    // Fallback object for UI if orphaned
    const finalCategory = category ? serializeForClient(category) as any : {
        id: "orphaned",
        name: "Без категории",
        description: "Товары, которым не назначена категория",
        prefix: null,
        color: "slate",
        icon: "box",
        isSystem: true,
        gender: "neuter"
    };

    const serializedParentCategory = parentCategory ? serializeForClient(parentCategory) as any : undefined;

    return (
        <div className="p-4">
            <CategoryDetailClient
                category={finalCategory}
                parentCategory={serializedParentCategory}
                subCategories={subCategories}
                items={items}
                storageLocations={locations}
                attributeTypes={attributeTypes as any}
                allAttributes={allAttributes as any}
                user={session}
            />
        </div>
    );
}
