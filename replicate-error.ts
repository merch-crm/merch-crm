import { db } from "./lib/db";
import { inventoryItems } from "./lib/schema";
import { eq } from "drizzle-orm";

async function replicate() {
    const id = "cbdf8c64-e972-46e3-8a71-112a27fccfcb";

    const updateData = {
        name: "Футболка Muse Wear Base Баблгам Kids",
        sku: "FT-BS-FRT-BUB-KDS",
        categoryId: "3f663eec-015e-44f8-ba73-565520f47207",
        itemType: "clothing" as const,
        quantity: 110,
        unit: "шт",
        lowStockThreshold: 10,
        criticalStockThreshold: 0,
        description: "",
        location: "",
        storageLocationId: "bbf7dcd6-7123-42b8-aec5-a0b9d3ba888f",
        qualityCode: "BS",
        materialCode: "FRT",
        brandCode: "",
        attributeCode: "BUB",
        sizeCode: "KDS",
        attributes: { "thumbnailSettings": { "x": 0, "y": 0, "zoom": 1 } },
        image: "/api/storage/local/SKU/Одежда/Футболка/Футболка Muse Wear Base Баблгам Kids/item-1768723804128-hvfw6p.jpg",
        imageBack: "/api/storage/local/SKU/Одежда/Футболка/Футболка Muse Wear Base Баблгам Kids/item-1768723804130-rn9yvh.jpg",
        imageSide: "/api/storage/local/SKU/Одежда/Футболка/Футболка Muse Wear Base Баблгам Kids/item-1768723804130-7zh9j9.jpg",
        imageDetails: ["/api/storage/local/SKU/Одежда/Футболка/Футболка Muse Wear Base Баблгам Kids/item-1768723804130-oiugs5.jpg", "/api/storage/local/SKU/Одежда/Футболка/Футболка Muse Wear Base Баблгам Kids/item-1768723804131-9bs2fk.jpg"],
        thumbnailSettings: { "zoom": 1, "x": 0, "y": 0 },
        reservedQuantity: 0
    };

    try {
        console.log("Attempting to replicate update failure...");
        await db.update(inventoryItems).set(updateData).where(eq(inventoryItems.id, id));
        console.log("SUCCESS: Update actually worked in script!");
    } catch (error) {
        console.error("FAILURE REPLICATED:");
        console.error(error);
    }
    process.exit(0);
}

replicate();
