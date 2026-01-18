import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CategoryDetailClient, Category, InventoryItem } from "./category-detail-client";
import { StorageLocation } from "../storage-locations-tab";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: categoryId } = await params;

    // Fetch category info and its parent if exists
    let category = null;
    let parentCategory = null;
    if (categoryId !== "orphaned") {
        const [found] = await db
            .select()
            .from(inventoryCategories)
            .where(eq(inventoryCategories.id, categoryId))
            .limit(1);
        category = found;

        if (!category) {
            notFound();
        }

        if (category.parentId) {
            const [parent] = await db
                .select()
                .from(inventoryCategories)
                .where(eq(inventoryCategories.id, category.parentId))
                .limit(1);
            parentCategory = parent;
        }
    }

    // Fetch subcategories for this category
    const subCategoriesRaw = categoryId === "orphaned"
        ? []
        : await db
            .select()
            .from(inventoryCategories)
            .where(eq(inventoryCategories.parentId, categoryId));

    const subCategories = subCategoriesRaw.map(sc => ({
        ...sc,
        createdAt: sc.createdAt.toISOString()
    }));

    // Fetch items for this specific category
    const { getInventoryItems } = await import("../actions");
    const { data: allItems = [] } = await getInventoryItems();

    // Filter items by current category
    const categoryItems = categoryId === "orphaned"
        ? allItems.filter(item => !item.categoryId)
        : allItems.filter(item => item.categoryId === categoryId);

    const items = categoryItems.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        attributes: (item.attributes as Record<string, string | number | boolean | null>) || {},
    }));

    // Fallback for orphaned
    const finalCategory = category ? {
        ...category,
        createdAt: category.createdAt.toISOString()
    } : {
        id: "orphaned",
        name: "Без категории",
        description: "Товары, которым не назначена категория",
        prefix: null,
    };

    // Fetch storage locations
    const { getStorageLocations, getMeasurementUnits } = await import("../actions");
    const { data: locations = [] } = await getStorageLocations();
    const { data: units = [] } = await getMeasurementUnits();


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
                measurementUnits={units as { id: string, name: string }[]}
                user={session}
            />
        </div>
    );
}
