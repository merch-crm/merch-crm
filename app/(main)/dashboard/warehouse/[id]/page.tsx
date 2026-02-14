import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { CategoryDetailClient } from "./category-detail-client";
import type { Category, InventoryItem, AttributeType, InventoryAttribute } from "./category-detail-client";
import type { StorageLocation } from "../storage-locations-tab";
import { getSession } from "@/lib/auth";
import { serializeForClient } from "@/lib/serialize";
import type { Serialized } from "@/lib/serialize";
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
    // Fetch all categories to calculate recursive counts
    const { getInventoryCategories } = await import("../actions");
    const allCatsRes = await getInventoryCategories();
    // Assuming getInventoryCategories returns { success: boolean, data?: Category[], error?: string }
    // We need to verify success and data existence.
    const allCats = (allCatsRes.success && (allCatsRes as any).data) ? (allCatsRes as any).data as Category[] : [];

    const countRecursiveTotalQty = (catId: string): number => {
        const cat = allCats.find((c: Category) => c.id === catId);
        if (!cat) return 0;
        let sum = cat.totalQuantity || 0;
        const children = allCats.filter((c: Category) => c.parentId === catId);
        for (const child of children) {
            sum += countRecursiveTotalQty(child.id);
        }
        return sum;
    };

    const subCategoriesRaw = resolvedCategoryId
        ? allCats
            .filter((c: Category) => c.parentId === resolvedCategoryId)
            .map((c: Category) => ({
                ...c,
                totalQuantity: countRecursiveTotalQty(c.id)
            }))
            .sort((a: Category, b: Category) => (b.totalQuantity || 0) - (a.totalQuantity || 0)) // Sort by qty desc
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

    const allItems = (itemsRes.success && (itemsRes as any).data) ? (itemsRes as any).data as InventoryItem[] : [];
    const locationsData = (locationsRes.success && (locationsRes as any).data) ? (locationsRes as any).data as StorageLocation[] : [];
    const typesData = (typesRes.success && (typesRes as any).data) ? (typesRes as any).data as AttributeType[] : [];
    const attrsData = (attrsRes.success && (attrsRes as any).data) ? (attrsRes as any).data as InventoryAttribute[] : [];

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
    const subCategories = serializeForClient(subCategoriesRaw) as Serialized<Category[]>;
    const items = serializeForClient(categoryItems) as Serialized<InventoryItem[]>;
    const locations = serializeForClient(locationsData) as Serialized<StorageLocation[]>;
    const attributeTypes = serializeForClient(typesData) as Serialized<AttributeType[]>;
    const allAttributes = serializeForClient(attrsData) as Serialized<InventoryAttribute[]>;

    // Fallback object for UI if orphaned
    const finalCategory = category ? serializeForClient(category) as Serialized<Category> : {
        id: "orphaned",
        name: "Без категории",
        description: "Товары, которым не назначена категория",
        prefix: null,
        color: "slate",
        icon: "box",
        isSystem: true,
        gender: "neuter",
        sortOrder: 0,
        isActive: true
    } as Serialized<Category>;

    const serializedParentCategory = parentCategory ? serializeForClient(parentCategory) as Serialized<Category> : undefined;

    return (
        <div className="p-4">
            <CategoryDetailClient
                category={finalCategory as Category}
                parentCategory={serializedParentCategory as Category}
                subCategories={subCategories as Category[]}
                items={items as InventoryItem[]}
                storageLocations={locations as StorageLocation[]}
                attributeTypes={attributeTypes as AttributeType[]}
                allAttributes={allAttributes as InventoryAttribute[]}
                user={session}
            />
        </div>
    );
}
