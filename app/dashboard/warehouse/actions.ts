"use server";

import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions,
    inventoryCategories,
    storageLocations,
    users,
    inventoryStocks,
    inventoryTransfers
} from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function getInventoryCategories() {
    try {
        const categories = await db.select().from(inventoryCategories).orderBy(desc(inventoryCategories.createdAt));
        return { data: categories };
    } catch (error) {
        console.error("Error fetching inventory categories:", error);
        return { error: "Failed to fetch inventory categories" };
    }
}

export async function addInventoryCategory(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const prefix = formData.get("prefix") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;

    if (!name) {
        return { error: "Name is required" };
    }

    try {
        await db.insert(inventoryCategories).values({
            name,
            description,
            prefix: prefix || null,
            icon: icon || "package",
            color: color || "indigo",
        }).returning();

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error adding category:", error);
        return { error: "Failed to add category" };
    }
}

export async function deleteInventoryCategory(id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // First, unlink all items from this category (set categoryId to null)
        await db.update(inventoryItems)
            .set({ categoryId: null })
            .where(eq(inventoryItems.categoryId, id));

        // Then delete the category
        await db.delete(inventoryCategories).where(eq(inventoryCategories.id, id));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { error: "Failed to delete category" };
    }
}

export async function updateInventoryCategory(id: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const prefix = formData.get("prefix") as string;

    if (!name) {
        return { error: "Name is required" };
    }

    try {
        await db.update(inventoryCategories)
            .set({
                name,
                description,
                icon: icon || null,
                color: color || null,
                prefix: prefix || null
            })
            .where(eq(inventoryCategories.id, id));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
    }
}

export async function getInventoryItems() {
    try {
        const items = await db.query.inventoryItems.findMany({
            with: {
                category: true
            },
            orderBy: desc(inventoryItems.createdAt)
        });
        return { data: items };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return { error: "Failed to fetch inventory items" };
    }
}

export async function addInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const unit = formData.get("unit") as string;
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string);
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const storageLocationId = formData.get("storageLocationId") as string;

    const qualityCode = formData.get("qualityCode") as string;
    const attributeCode = formData.get("attributeCode") as string;
    const sizeCode = formData.get("sizeCode") as string;

    if (!name || isNaN(quantity)) {
        return { error: "Invalid data" };
    }

    try {
        await db.transaction(async (tx) => {
            // Auto-generate SKU if components are provided
            let finalSku = sku;
            if (categoryId && (qualityCode || attributeCode || sizeCode)) {
                const [cat] = await tx.select().from(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).limit(1);
                if (cat?.prefix) {
                    finalSku = [cat.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-").toUpperCase();
                }
            }

            const [newItem] = await tx.insert(inventoryItems).values({
                name,
                sku: finalSku || null,
                quantity,
                unit,
                lowStockThreshold,
                description,
                location,
                storageLocationId: storageLocationId || null,
                categoryId: categoryId || null,
                qualityCode: qualityCode || null,
                attributeCode: attributeCode || null,
                sizeCode: sizeCode || null
            }).returning();

            // Create stock record if location is selected
            if (storageLocationId) {
                await tx.insert(inventoryStocks).values({
                    itemId: newItem.id,
                    storageLocationId,
                    quantity
                });
            }

            // Log transaction
            await tx.insert(inventoryTransactions).values({
                itemId: newItem.id,
                changeAmount: quantity,
                type: "in",
                reason: "Initial stock",
                storageLocationId: storageLocationId || null,
                createdBy: session.id,
            });

            await logAction("Поставка", "inventory_item", newItem.id, {
                name,
                quantity,
                sku: finalSku,
                storageLocationId
            });
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding item:", error);
        return { error: "Failed to add item" };
    }
}

export async function deleteInventoryItems(ids: string[]) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.delete(inventoryItems).where(inArray(inventoryItems.id, ids));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error deleting items:", error);
        return { error: "Failed to delete items" };
    }
}

export async function updateInventoryItem(id: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const unit = formData.get("unit") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string);
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const storageLocationId = formData.get("storageLocationId") as string;

    const qualityCode = formData.get("qualityCode") as string;
    const attributeCode = formData.get("attributeCode") as string;
    const sizeCode = formData.get("sizeCode") as string;

    try {
        // Auto-generate SKU if components are provided
        let finalSku = sku;
        if (categoryId && (qualityCode || attributeCode || sizeCode)) {
            const [cat] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).limit(1);
            if (cat?.prefix) {
                finalSku = [cat.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-").toUpperCase();
            }
        }

        await db.update(inventoryItems).set({
            name,
            sku: finalSku || null,
            unit,
            quantity,
            lowStockThreshold,
            categoryId: categoryId || null,
            description,
            location,
            storageLocationId: storageLocationId || null,
            qualityCode: qualityCode || null,
            attributeCode: attributeCode || null,
            sizeCode: sizeCode || null
        }).where(eq(inventoryItems.id, id));

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating item:", error);
        return { error: "Failed to update item" };
    }
}

export async function getInventoryHistory() {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            with: {
                item: {
                    with: {
                        storageLocation: true
                    }
                },
                creator: {
                    with: {
                        role: true
                    }
                }
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 50
        });
        return { data: history };
    } catch (error) {
        console.error("Error fetching inventory history:", error);
        return { error: "Failed to fetch inventory history" };
    }
}

export async function adjustInventoryStock(itemId: string, amount: number, type: "in" | "out", reason: string, storageLocationId?: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.transaction(async (tx) => {
            // 1. Get current item for its categoryId and name
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
            if (!item) throw new Error("Item not found");

            const netChange = amount * (type === "in" ? 1 : -1);
            const newTotalQuantity = item.quantity + netChange;
            if (newTotalQuantity < 0) throw new Error("Insufficient total stock");

            // 2. If storageLocationId is provided, manage per-warehouse stock
            if (storageLocationId) {
                const [existingStock] = await tx
                    .select()
                    .from(inventoryStocks)
                    .where(and(
                        eq(inventoryStocks.itemId, itemId),
                        eq(inventoryStocks.storageLocationId, storageLocationId)
                    ))
                    .limit(1);

                if (existingStock) {
                    const newStockQuantity = existingStock.quantity + netChange;
                    if (newStockQuantity < 0) throw new Error("Insufficient stock at this location");

                    await tx.update(inventoryStocks)
                        .set({ quantity: newStockQuantity, updatedAt: new Date() })
                        .where(eq(inventoryStocks.id, existingStock.id));
                } else {
                    // Lazy Migration: If no stock entry exists, but item is ostensibly at this location in legacy field
                    // or if it's a new stock at a new location.
                    let initialQuantity = 0;
                    if (item.storageLocationId === storageLocationId) {
                        initialQuantity = item.quantity;
                    }

                    const finalStockQuantity = initialQuantity + netChange;
                    if (finalStockQuantity < 0) throw new Error("Insufficient stock at this location");

                    await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId,
                        quantity: finalStockQuantity
                    });
                }
            }

            // 3. Update global item quantity (cached sum of all warehouses)
            await tx.update(inventoryItems)
                .set({ quantity: newTotalQuantity })
                .where(eq(inventoryItems.id, itemId));

            // 4. Log transaction with location info
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: netChange,
                type,
                reason,
                storageLocationId: storageLocationId || null,
                createdBy: session.id,
            });

            // 5. Log audit action
            await logAction(type === "in" ? "Поставка" : "Списание", "inventory_item", itemId, {
                name: item.name,
                amount,
                reason,
                storageLocationId,
                newTotalQuantity
            });
        });

        revalidatePath("/dashboard/warehouse");
        // Revalidate category page if needed
        const [item] = await db.select({ catId: inventoryItems.categoryId }).from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
        if (item?.catId) revalidatePath(`/dashboard/warehouse/${item.catId}`);

        return { success: true };
    } catch (error: unknown) {
        console.error("Error adjusting stock:", error);
        return { error: (error as Error).message || "Failed to adjust stock" };
    }
}

export async function getItemStocks(itemId: string) {
    try {
        const stocks = await db.query.inventoryStocks.findMany({
            where: eq(inventoryStocks.itemId, itemId),
            with: {
                storageLocation: true
            }
        });
        return { data: stocks };
    } catch (error) {
        console.error("Error fetching item stocks:", error);
        return { error: "Failed to fetch item stocks" };
    }
}

export async function getItemHistory(itemId: string) {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            where: eq(inventoryTransactions.itemId, itemId),
            with: {
                creator: true,
                storageLocation: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 50
        });
        return { data: history };
    } catch (error) {
        console.error("Error fetching item history:", error);
        return { error: "Failed to fetch item history" };
    }
}

// Storage Locations Actions
export async function getStorageLocations() {
    try {
        // Use direct query instead of db.query to avoid potential issues
        const locations = await db
            .select({
                id: storageLocations.id,
                name: storageLocations.name,
                address: storageLocations.address,
                description: storageLocations.description,
                responsibleUserId: storageLocations.responsibleUserId,
                createdAt: storageLocations.createdAt,
                responsibleUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                }
            })
            .from(storageLocations)
            .leftJoin(users, eq(storageLocations.responsibleUserId, users.id))
            .orderBy(storageLocations.name);

        const locationsWithItems = await Promise.all(
            locations.map(async (loc) => {
                // 1. Get items from Stocks (New Architecture)
                const stockItems = await db
                    .select({
                        id: inventoryItems.id,
                        name: inventoryItems.name,
                        quantity: inventoryStocks.quantity,
                        unit: inventoryItems.unit,
                        sku: inventoryItems.sku,
                        categoryName: inventoryCategories.name
                    })
                    .from(inventoryStocks)
                    .innerJoin(inventoryItems, eq(inventoryStocks.itemId, inventoryItems.id))
                    .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
                    .where(and(
                        eq(inventoryStocks.storageLocationId, loc.id),
                        sql`${inventoryStocks.quantity} > 0`
                    ));

                // 2. Get items from Legacy fields (Fallback)
                const legacyItems = await db
                    .select({
                        id: inventoryItems.id,
                        name: inventoryItems.name,
                        quantity: inventoryItems.quantity,
                        unit: inventoryItems.unit,
                        sku: inventoryItems.sku,
                        categoryName: inventoryCategories.name
                    })
                    .from(inventoryItems)
                    .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
                    .where(and(
                        eq(inventoryItems.storageLocationId, loc.id),
                        sql`${inventoryItems.quantity} > 0`
                    ));

                // 3. Merge Strategies (Priority to Stocks)
                const itemsMap = new Map();
                // Add legacy first
                legacyItems.forEach(item => itemsMap.set(item.id, item));
                // Add/Overwrite with stocks (because if stock exists, it's the truth source for this location)
                stockItems.forEach(item => itemsMap.set(item.id, item));

                // Note: If an item is in both legacy (loc A) and stocks (loc A), stock wins.
                // If an item was moved to loc B (stock), but still has legacy loc A, it will show in A?
                // Yes, until we fully migrate quantity out of item table. 
                // But moveInventory creates stock on B. It doesn't clear legacy A unless we do it.
                // For now, this is acceptable for transition.

                return {
                    ...loc,
                    items: Array.from(itemsMap.values())
                };
            })
        );

        return { data: locationsWithItems };
    } catch (error) {
        console.error("Error fetching storage locations:", error);
        return { error: "Failed to fetch storage locations" };
    }
}

export async function addStorageLocation(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;

    if (!name || !address) {
        return { error: "Name and address are required" };
    }

    try {
        await db.insert(storageLocations).values({
            name,
            address,
            description: description || null,
            responsibleUserId: responsibleUserId || null,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error adding storage location:", error);
        return { error: "Failed to add storage location" };
    }
}

export async function deleteStorageLocation(id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Unlink items
        await db.update(inventoryItems)
            .set({ storageLocationId: null })
            .where(eq(inventoryItems.storageLocationId, id));

        await db.delete(storageLocations).where(eq(storageLocations.id, id));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error deleting storage location:", error);
        return { error: "Failed to delete storage location" };
    }
}

export async function updateStorageLocation(id: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;

    try {
        await db.update(storageLocations).set({
            name,
            address,
            description: description || null,
            responsibleUserId: responsibleUserId || null,
        }).where(eq(storageLocations.id, id));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Error updating storage location:", error);
        return { error: "Failed to update storage location" };
    }
}

export async function getAllUsers() {
    try {
        const allUsers = await db.select().from(users).orderBy(users.name);
        return { data: allUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { error: "Failed to fetch users" };
    }
}

export async function seedStorageLocations() {
    const locations = [
        { name: "Производство", address: "Пушкина 71" },
        { name: "Стас", address: "Роз 355а" },
        { name: "Леня", address: "Доваторцев 67" },
        { name: "Денис", address: "Тухачевского 26/1" }
    ];

    try {
        for (const loc of locations) {
            const existing = await db.select().from(storageLocations).where(eq(storageLocations.name, loc.name)).limit(1);
            if (existing.length === 0) {
                await db.insert(storageLocations).values({
                    name: loc.name,
                    address: loc.address,
                });
            }
        }
        // Removed revalidatePath - this function is called during render
        return { success: true };
    } catch (error) {
        console.error("Error seeding storage locations:", error);
        return { error: "Failed to seed" };
    }
}

export async function moveInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Not authorized" };

    const itemId = formData.get("itemId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const toLocationId = formData.get("toLocationId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const comment = formData.get("comment") as string;

    if (!itemId || !fromLocationId || !toLocationId || !quantity) {
        return { error: "Missing required fields" };
    }

    if (fromLocationId === toLocationId) {
        return { error: "Source and destination cannot be the same" };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Get/Init Source Stock
            let sourceStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                )
            });

            // Legacy Fallback: If no stock record, check legacy item field
            if (!sourceStock) {
                const item = await tx.query.inventoryItems.findFirst({
                    where: eq(inventoryItems.id, itemId)
                });

                if (item && item.storageLocationId === fromLocationId && item.quantity >= quantity) {
                    const [newStock] = await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId: fromLocationId,
                        quantity: item.quantity
                    }).returning();
                    sourceStock = newStock;
                }
            }

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error("Недостаточно товара на исходном складе");
            }

            // 2. Decrement Source
            await tx.update(inventoryStocks)
                .set({
                    quantity: sql`${inventoryStocks.quantity} - ${quantity}`,
                    updatedAt: new Date()
                })
                .where(eq(inventoryStocks.id, sourceStock.id));

            // 3. Increment/Create Target
            const targetStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, toLocationId)
                )
            });

            if (targetStock) {
                await tx.update(inventoryStocks)
                    .set({
                        quantity: sql`${inventoryStocks.quantity} + ${quantity}`,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryStocks.id, targetStock.id));
            } else {
                await tx.insert(inventoryStocks).values({
                    itemId,
                    storageLocationId: toLocationId,
                    quantity: quantity
                });
            }

            // 4. Log Transfer
            await tx.insert(inventoryTransfers).values({
                itemId,
                fromLocationId,
                toLocationId,
                quantity,
                comment,
                createdBy: session.id
            });

            // 6. Log Transactions (OUT from source, IN to target)
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: -quantity,
                type: "out",
                reason: `Перемещение (Transfer) на склад ${toLocationId}: ${comment || ''}`,
                createdBy: session.id
            });

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: quantity,
                type: "in",
                reason: `Перемещение (Transfer) со склада ${fromLocationId}: ${comment || ''}`,
                createdBy: session.id
            });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error: unknown) {
        console.error("Move error:", error);
        return { error: (error as Error).message || "Failed to move inventory" };
    }
}
