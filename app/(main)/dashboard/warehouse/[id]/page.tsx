import { db } from "@/lib/db";

import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { CategoryDetailClient, type Category, type InventoryItem, type AttributeType, type InventoryAttribute } from "./category-detail-client";
import type { StorageLocation, InventoryFilters } from "../types";
import { getSession } from "@/lib/auth";
import { serializeForClient, type Serialized } from "@/lib/serialize";
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

export default async function CategoryPage({
    params,
    searchParams
}: PageParams & { searchParams: Promise<{ page?: string; search?: string; status?: string; storage?: string }> }) {
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
    const { getInventoryCategories, getInventoryItems, getStorageLocations, getInventoryAttributeTypes, getInventoryAttributes } = await import("../actions");
    const allCatsRes = await getInventoryCategories();
    const allCats = (allCatsRes.success ? allCatsRes.data : []) as Category[];

    const countRecursiveTotalQty = (catId: string): number => {
        const cat = allCats.find((c: Category) => c.id === catId);
        if (!cat) return 0;
        let sum = (cat.totalQuantity || 0) as number;
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

    // Aggregate IDs of this category and all its descendants
    const getAllDescendantIds = (catId: string, cats: Category[]): string[] => {
        const ids = [catId];
        const children = cats.filter(c => c.parentId === catId);
        for (const child of children) {
            ids.push(...getAllDescendantIds(child.id, cats));
        }
        return ids;
    };

    const targetCategoryIds: string[] = resolvedCategoryId
        ? getAllDescendantIds(resolvedCategoryId, allCats)
        : [];

    // Fetch items with filters
    const searchParamsObj = await searchParams;
    const page = Number(searchParamsObj.page) || 1;
    const limit = 20;

    const [itemsRes, locationsRes, typesRes, attrsRes] = await Promise.all([
        getInventoryItems({
            categoryIds: targetCategoryIds,
            page,
            limit,
            search: searchParamsObj.search,
            status: searchParamsObj.status as InventoryFilters["status"],
            storageLocationId: searchParamsObj.storage,
            onlyOrphaned: paramId === "orphaned"
        }),
        getStorageLocations(),
        getInventoryAttributeTypes(),
        getInventoryAttributes()
    ]);

    const itemsData = itemsRes.success && itemsRes.data ? itemsRes.data : { items: [], total: 0 };
    const categoryItems = itemsData.items;
    const totalItems = itemsData.total;

    // Use explicit any cast or optional chaining to avoid type inference issues with success property widening
    const locationsData = locationsRes.success ? locationsRes.data : [] as StorageLocation[];
    const typesData = typesRes.success ? typesRes.data : [] as AttributeType[];
    const attrsData = attrsRes.success ? attrsRes.data : [] as InventoryAttribute[];

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
                totalItems={totalItems}
                currentPage={page}
                storageLocations={locations as StorageLocation[]}

                attributeTypes={attributeTypes as AttributeType[]}
                allAttributes={allAttributes as InventoryAttribute[]}
                user={session}
            />
        </div>
    );
}
