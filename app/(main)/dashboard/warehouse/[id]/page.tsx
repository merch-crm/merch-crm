import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CategoryDetailClient, Category, InventoryItem } from "./category-detail-client";
import { StorageLocation } from "../storage-locations-tab";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: paramId } = await params;
    if (paramId === "orphaned") return { title: "Без категории | Склад" };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);
    const [found] = await db
        .select({ name: inventoryCategories.name })
        .from(inventoryCategories)
        .where(isUuid ? eq(inventoryCategories.id, paramId) : eq(inventoryCategories.slug, paramId))
        .limit(1);

    return { title: found ? `${found.name} | Склад` : "Категория | Склад" };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: paramId } = await params;

    // Fetch category info and its parent if exists
    let category = null;
    let parentCategory = null;
    let resolvedCategoryId: string | null = null;

    if (paramId === "orphaned") {
        resolvedCategoryId = null; // orphaned
    } else {
        // Check if ID is UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);

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
            query.where(eq(inventoryCategories.id, paramId));
        } else {
            query.where(eq(inventoryCategories.slug, paramId));
        }

        const [found] = await query.limit(1);
        category = found;

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

    const subCategories = subCategoriesRaw.map(sc => ({
        ...sc,
        createdAt: sc.createdAt.toISOString()
    }));

    // Fetch items
    const { getInventoryItems } = await import("../actions");
    const { data: allItems = [] } = await getInventoryItems();

    // Aggregate IDs of this category and all its descendants
    const getAllDescendantIds = (catId: string, allCats: { id: string; parentId: string | null }[]): string[] => {
        const ids = [catId];
        const children = allCats.filter(c => c.parentId === catId);
        for (const child of children) {
            ids.push(...getAllDescendantIds(child.id, allCats));
        }
        return ids;
    };

    // We need all categories for recursion
    const allCategoriesRaw = await db.select({ id: inventoryCategories.id, parentId: inventoryCategories.parentId }).from(inventoryCategories);

    const targetCategoryIds: (string | null)[] = resolvedCategoryId
        ? getAllDescendantIds(resolvedCategoryId, allCategoriesRaw)
        : [null];

    const categoryItems = allItems.filter(item =>
        resolvedCategoryId
            ? targetCategoryIds.includes(item.categoryId)
            : !item.categoryId
    );

    const items = categoryItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        attributes: (item.attributes as Record<string, string | number | boolean | null>) || {},
    }));

    // Fallback object for UI if orphaned
    const finalCategory = category ? {
        ...category,
        createdAt: new Date(category.createdAt).toISOString()
    } : {
        id: "orphaned",
        name: "Без категории",
        description: "Товары, которым не назначена категория",
        prefix: null,
        color: "slate",
        icon: "box",
        isSystem: true,
        gender: "neuter"
    };

    // Fetch storage locations
    const { getStorageLocations, getInventoryAttributeTypes, getInventoryAttributes } = await import("../actions");
    const [locationsRes, typesRes, attrsRes] = await Promise.all([
        getStorageLocations(),
        getInventoryAttributeTypes(),
        getInventoryAttributes()
    ]);

    const locations = locationsRes.data || [];
    const attributeTypes = typesRes.data || [];
    const allAttributes = attrsRes.data || [];

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();

    return (
        <div className="p-1">
            <CategoryDetailClient
                category={finalCategory as unknown as Category}
                parentCategory={parentCategory ? { ...parentCategory, createdAt: parentCategory.createdAt.toISOString() } as unknown as Category : undefined}
                subCategories={subCategories as unknown as Category[]}
                items={items as unknown as InventoryItem[]}
                storageLocations={locations as unknown as StorageLocation[]}
                attributeTypes={attributeTypes as unknown as import("./category-detail-client").AttributeType[]}
                allAttributes={allAttributes as unknown as import("./category-detail-client").InventoryAttribute[]}
                user={session}
            />
        </div>
    );
}
