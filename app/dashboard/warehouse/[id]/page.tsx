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

    // Fetch items for this category
    const itemsRaw = await db
        .select()
        .from(inventoryItems)
        .where(
            categoryId === "orphaned"
                ? isNull(inventoryItems.categoryId)
                : eq(inventoryItems.categoryId, categoryId)
        );

    // Sanitize items for client component (ensure Dates are strings if needed, though Next handles top level)
    const items = itemsRaw.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
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

    return (
        <div className="p-1">
            <CategoryDetailClient
                category={finalCategory}
                items={items}
                storageLocations={locations}
            />
        </div>
    );
}
