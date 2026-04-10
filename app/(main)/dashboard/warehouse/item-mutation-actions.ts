"use server";

import path from "path";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { inventoryCategories } from "@/lib/schema/warehouse/categories";
import { inventoryStocks, inventoryTransactions } from "@/lib/schema/warehouse/stock";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { checkItemStockAlerts } from "@/lib/notifications";
import { 
 ActionResult, 
 ok, 
} from "@/lib/types";
import { 
 withAuth, 
 ValidationError,
 NotFoundError,
} from "@/lib/action-helpers";
import { InventoryItemSchema } from "./validation";
import { getCategoryPath, saveFile } from "./actions-utils";
import { sanitizeFileName, sanitize } from "./shared-utils";

/**
 * Add new inventory item
 */
export async function addInventoryItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return withAuth(async (session) => {
    const dataObj = Object.fromEntries(formData);
    const validation = InventoryItemSchema.safeParse(dataObj);
    if (!validation.success) {
      throw ValidationError(validation.error.issues[0].message);
    }

    const {
      itemType, name, sku, quantity, unit, lowStockThreshold, criticalStockThreshold,
      categoryId, description, storageLocationId,
      qualityCode, materialCode, attributeCode, sizeCode, brandCode,
      costPrice, sellingPrice,
      attributes: baseAttributes, thumbnailSettings,
      width, height, depth, weight, packagingType: pkgType, supplierName, supplierLink, minBatch, features,
      department
    } = validation.data;

    const attributes: Record<string, unknown> = { ...baseAttributes };

    if (itemType === "packaging") {
      Object.assign(attributes, {
        width, height, depth, weight,
        packagingType: pkgType,
        supplierName, supplierLink, minBatch,
        features
      });
    } else if (itemType === "consumables") {
      Object.assign(attributes, { department });
    }

    const newItem = await db.transaction(async (tx) => {
      let finalSku = sku;
      if (categoryId && (qualityCode || materialCode || attributeCode || sizeCode || brandCode)) {
        const [cat] = await tx.select().from(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).limit(1);
        if (cat?.prefix) {
          finalSku = [cat.prefix, brandCode, qualityCode, materialCode, attributeCode, sizeCode].filter(Boolean).join("-").toUpperCase();
        }
      }

      const categoryPath = await getCategoryPath(categoryId || null);
      const itemFolderPath = path.join(categoryPath, sanitizeFileName(name || "unnamed"));

      const imageFile = formData.get("image") as File;
      const imageBackFile = formData.get("imageBack") as File;
      const imageSideFile = formData.get("imageSide") as File;
      const imageDetailsFiles = formData.getAll("imageDetails") as File[];

      const mainImageUrl = await saveFile(imageFile, itemFolderPath);
      const backImageUrl = await saveFile(imageBackFile, itemFolderPath);
      const sideImageUrl = await saveFile(imageSideFile, itemFolderPath);

      const detailImageUrls: string[] = [];
      for (const file of imageDetailsFiles) {
        const url = await saveFile(file, itemFolderPath);
        if (url) detailImageUrls.push(url);
      }

      const values = {
        itemType: (itemType as "clothing" | "packaging" | "consumables") || "clothing",
        name: name || "Без названия",
        sku: finalSku || null,
        categoryId: categoryId || null,
        quantity: Number(quantity) || 0,
        unit: (unit as "шт." | "л" | "м" | "кг") || "шт.",
        lowStockThreshold: Number(lowStockThreshold) || 10,
        criticalStockThreshold: Number(criticalStockThreshold) || 0,
        description,
        image: mainImageUrl,
        imageBack: backImageUrl,
        imageSide: sideImageUrl,
        imageDetails: detailImageUrls,
        costPrice: costPrice?.toString() || "0",
        sellingPrice: sellingPrice?.toString() || "0",
        qualityCode,
        materialCode,
        brandCode,
        attributeCode,
        sizeCode,
        attributes,
        thumbnailSettings: thumbnailSettings ? (typeof thumbnailSettings === 'string' ? JSON.parse(thumbnailSettings) : thumbnailSettings) : null,
        createdBy: session.id,
      };

      const [item] = await tx.insert(inventoryItems).values(values).returning();

      if (storageLocationId) {
        await tx.insert(inventoryStocks).values({
          itemId: item.id,
          storageLocationId,
          quantity: Number(quantity)
        });

        await tx.insert(inventoryTransactions).values({
          itemId: item.id,
          type: "in",
          changeAmount: Number(quantity),
          storageLocationId: storageLocationId,
          reason: "Создание позиции",
          createdBy: session.id
        });
      }

      await logAction("Создан товар", "inventory_item", item.id, { name: item.name, sku: item.sku }, tx);
      return item;
    });

    invalidateCache("warehouse:*");
    revalidatePath("/dashboard/warehouse");

    if (newItem.id) {
      await checkItemStockAlerts(newItem.id);
    }

    return ok({ id: newItem.id });
  }, { 
    roles: ["admin", "management", "warehouse", "sales"],
    errorPath: "/dashboard/warehouse/add" 
  });
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(id: string, formData: FormData): Promise<ActionResult<typeof inventoryItems.$inferSelect>> {
  return withAuth(async (session) => {
    const dataObj = Object.fromEntries(formData);
    const validation = InventoryItemSchema.safeParse(dataObj);
    if (!validation.success) {
      throw ValidationError(validation.error.issues[0].message);
    }

    const {
      itemType, sku, quantity, lowStockThreshold, criticalStockThreshold,
      reservedQuantity, categoryId, storageLocationId,
      qualityCode, materialCode, attributeCode, sizeCode, brandCode,
      attributes: baseAttributes, thumbnailSettings,
      width, height, depth, weight, packagingType: pkgType, supplierName, supplierLink, minBatch, features,
      department, costPrice, sellingPrice, materialComposition
    } = validation.data;

    const name = sanitize(validation.data.name);
    const description = validation.data.description ? sanitize(validation.data.description) : "";
    let unit = validation.data.unit;

    const attributes: Record<string, unknown> = { ...baseAttributes };

    if (itemType === "packaging") {
      Object.assign(attributes, {
        width, height, depth, weight,
        packagingType: pkgType,
        supplierName, supplierLink, minBatch,
        features
      });
    } else if (itemType === "consumables") {
      Object.assign(attributes, { department });
    }

    const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
    if (!existingItem) {
      throw NotFoundError("Товар");
    }

    if (existingItem.itemType === "clothing") {
      unit = "шт.";
    }

    const categoryPath = await getCategoryPath(categoryId || null);
    const itemFolderPath = path.join(categoryPath, sanitizeFileName(name || "unnamed"));

    const imageFile = formData.get("image") as File;
    const imageBackFile = formData.get("imageBack") as File;
    const imageSideFile = formData.get("imageSide") as File;
    const imageDetailsFiles = formData.getAll("imageDetails") as File[];

    let imageUrl = (formData.get("currentImage") as string) || existingItem.image || null;
    let imageBackUrl = (formData.get("currentImageBack") as string) || existingItem.imageBack || null;
    let imageSideUrl = (formData.get("currentImageSide") as string) || existingItem.imageSide || null;

    const newImageUrl = await saveFile(imageFile, itemFolderPath);
    if (newImageUrl) imageUrl = newImageUrl;

    const newImageBackUrl = await saveFile(imageBackFile, itemFolderPath);
    if (newImageBackUrl) imageBackUrl = newImageBackUrl;

    const newImageSideUrl = await saveFile(imageSideFile, itemFolderPath);
    if (newImageSideUrl) imageSideUrl = newImageSideUrl;

    let imageDetailsUrls: string[] = [];
    const currentDetailsStr = formData.get("currentImageDetails") as string;
    if (currentDetailsStr) {
      try {
        imageDetailsUrls = JSON.parse(currentDetailsStr);
      } catch {
        imageDetailsUrls = (existingItem.imageDetails as string[]) || [];
      }
    }

    for (const file of imageDetailsFiles) {
      const url = await saveFile(file, itemFolderPath);
      if (url) imageDetailsUrls.push(url);
    }

    const isArchived = formData.get("isArchived") === "true";

    const updatedItem = await db.transaction(async (tx) => {
      const [item] = await tx.update(inventoryItems).set({
        name,
        sku: sku || null,
        itemType: (itemType as "clothing" | "packaging" | "consumables") || "clothing",
        quantity,
        lowStockThreshold,
        criticalStockThreshold,
        categoryId: categoryId || null,
        description,
        qualityCode,
        materialCode,
        brandCode,
        attributeCode,
        sizeCode,
        attributes: attributes || {},
        thumbnailSettings,
        image: imageUrl,
        imageBack: imageBackUrl,
        imageSide: imageSideUrl,
        imageDetails: imageDetailsUrls,
        reservedQuantity: reservedQuantity ?? 0,
        unit: (unit as "шт." | "л" | "м" | "кг") || "шт.",
        costPrice: costPrice?.toString() || "0",
        sellingPrice: sellingPrice?.toString() || "0",
        materialComposition: materialComposition || {},
        isArchived,
        updatedAt: new Date()
      }).where(eq(inventoryItems.id, id)).returning();

      const oldPrice = parseFloat(existingItem.costPrice || "0");
      const newPrice = parseFloat(costPrice?.toString() || "0");

      if (Math.abs(oldPrice - newPrice) > 0.01) {
        await tx.insert(inventoryTransactions).values({
          itemId: id,
          changeAmount: 0,
          type: "in",
          reason: "Корректировка цены (редактирование)",
          storageLocationId: storageLocationId || null,
          costPrice: costPrice?.toString() || "0",
          createdBy: session.id,
        });
      }
      return item;
    });

    await checkItemStockAlerts(id);
    revalidatePath("/dashboard/warehouse");
    if (categoryId) revalidatePath(`/dashboard/warehouse/categories/${categoryId}`);
    return ok(updatedItem);
  }, { 
    roles: ["admin", "management", "warehouse", "sales"],
    errorPath: `/dashboard/warehouse/edit/${id}` 
  });
}
