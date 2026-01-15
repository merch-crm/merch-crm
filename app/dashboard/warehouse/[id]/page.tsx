import { db } from "@/lib/db";
import { inventoryCategories, inventoryItems, storageLocations } from "@/lib/schema";
import { eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CategoryDetailClient } from "./category-detail-client";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: categoryId } = await params;

    // Fetch category info
    let category = null;
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

    // Fetch items for this category (direct items)
    const itemsRaw = await db
        .select()
        .from(inventoryItems)
        .where(
            categoryId === "orphaned"
                ? isNull(inventoryItems.categoryId)
                : eq(inventoryItems.categoryId, categoryId)
        );

    const items = itemsRaw.map(item => ({
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
    const locations = await db.select().from(storageLocations);

    // Fetch measurement units
    const { getMeasurementUnits } = await import("../actions");
    const { data: units = [] } = await getMeasurementUnits();

    return (
        <div className="p-1">
            <CategoryDetailClient
                category={finalCategory as unknown as import("./category-detail-client").Category}
                subCategories={subCategories as unknown as import("./category-detail-client").Category[]}
                items={items as unknown as import("./category-detail-client").InventoryItem[]}
                storageLocations={locations}
                measurementUnits={units}
            />
        </div>
    );
}
