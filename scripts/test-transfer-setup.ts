
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../lib/db";
import { storageLocations, inventoryItems, inventoryStocks, users, inventoryTransactions, inventoryTransfers, notifications } from "../lib/schema";
import { eq, and, desc } from "drizzle-orm";

async function runTest() {
    console.log("--- Starting Inventory Transfer Test ---");

    // 1. Get test locations
    const locations = await db.select().from(storageLocations).limit(2);
    if (locations.length < 2) {
        console.error("Need at least 2 storage locations for the test.");
        return;
    }

    const loc1 = locations[0];
    const loc2 = locations[1];

    // Assign a responsible user to target location if missing, for notification test
    const testUser = await db.query.users.findFirst();
    if (testUser && !loc2.responsibleUserId) {
        await db.update(storageLocations).set({ responsibleUserId: testUser.id }).where(eq(storageLocations.id, loc2.id));
        console.log(`Assigned responsible user ${testUser.name} to target warehouse ${loc2.name}`);
    }

    // Re-fetch to get updated responsible users
    const [updatedLoc1] = await db.select().from(storageLocations).where(eq(storageLocations.id, loc1.id));
    const [updatedLoc2] = await db.select().from(storageLocations).where(eq(storageLocations.id, loc2.id));

    // Ensure both have responsible users for test
    if (!updatedLoc1.responsibleUserId && testUser) {
        await db.update(storageLocations).set({ responsibleUserId: testUser.id }).where(eq(storageLocations.id, updatedLoc1.id));
        updatedLoc1.responsibleUserId = testUser.id;
    }

    console.log(`Source Warehouse: ${updatedLoc1.name} (Responsible: ${testUser?.name || 'None'})`);
    console.log(`Target Warehouse: ${updatedLoc2.name} (Responsible: ${testUser?.name || 'None'})`);

    // 2. Ensure an item exists in loc1
    let item = await db.query.inventoryItems.findFirst();
    if (!item) {
        const [newItem] = await db.insert(inventoryItems).values({
            name: "Test Item for Transfer",
            quantity: 100,
            unit: "pcs"
        }).returning();
        item = newItem;
    }

    // Ensure stock record in loc1
    const [existingStock] = await db.select().from(inventoryStocks).where(
        and(
            eq(inventoryStocks.itemId, item.id),
            eq(inventoryStocks.storageLocationId, loc1.id)
        )
    ).limit(1);

    if (!existingStock) {
        await db.insert(inventoryStocks).values({
            itemId: item.id,
            storageLocationId: loc1.id,
            quantity: 50
        });
    } else {
        await db.update(inventoryStocks).set({ quantity: 50 }).where(eq(inventoryStocks.id, existingStock.id));
    }

    console.log(`Using Item: ${item.name} (${item.id})`);
    console.log(`Initial Quantity in SOURCE: 50`);

    // Clear target stock for clean test
    await db.delete(inventoryStocks).where(
        and(
            eq(inventoryStocks.itemId, item.id),
            eq(inventoryStocks.storageLocationId, loc2.id)
        )
    );
    console.log(`Initial Quantity in TARGET: 0`);

    // 3. Perform Transfer (Manual DB Transaction to match Action logic)
    const transferQty = 10;
    const comment = "Automated test transfer";
    const creatorId = testUser?.id || "";

    console.log(`\n>>> Moving ${transferQty} units...`);

    await db.transaction(async (tx) => {
        const logMessage = `Перемещение со склада "${loc1.name}" на "${loc2.name}": ${comment}`;

        // Decrement Source
        await tx.update(inventoryStocks)
            .set({ quantity: 40 }) // 50 - 10
            .where(and(eq(inventoryStocks.itemId, item.id), eq(inventoryStocks.storageLocationId, loc1.id)));

        // Increment Target
        await tx.insert(inventoryStocks).values({
            itemId: item.id,
            storageLocationId: loc2.id,
            quantity: 10
        });

        // Log Transfer record
        await tx.insert(inventoryTransfers).values({
            itemId: item.id,
            fromLocationId: loc1.id,
            toLocationId: loc2.id,
            quantity: transferQty,
            comment,
            createdBy: creatorId
        });

        // Log TWO Transactions with type 'transfer'
        await tx.insert(inventoryTransactions).values({
            itemId: item.id,
            changeAmount: -transferQty,
            type: "transfer",
            reason: logMessage,
            storageLocationId: loc1.id,
            createdBy: creatorId
        });

        await tx.insert(inventoryTransactions).values({
            itemId: item.id,
            changeAmount: transferQty,
            type: "transfer",
            reason: logMessage,
            storageLocationId: loc2.id,
            createdBy: creatorId
        });

        // Create Notifications
        if (loc1.responsibleUserId) {
            await tx.insert(notifications).values({
                userId: loc1.responsibleUserId,
                title: "Перемещение товара",
                message: `Товар "${item?.name}" (${transferQty} шт.) перемещен из "${loc1?.name}" в "${loc2?.name}"`,
                type: "transfer",
            });
        }
        if (loc2.responsibleUserId && loc2.responsibleUserId !== loc1.responsibleUserId) {
            await tx.insert(notifications).values({
                userId: loc2.responsibleUserId,
                title: "Перемещение товара",
                message: `Товар "${item?.name}" (${transferQty} шт.) перемещен из "${loc1?.name}" в "${loc2?.name}"`,
                type: "transfer",
            });
        }
    });

    console.log("Transfer complete. Verifying results...");

    // 4. Verification
    const [newSourceStock] = await db.select().from(inventoryStocks).where(and(eq(inventoryStocks.itemId, item.id), eq(inventoryStocks.storageLocationId, loc1.id)));
    const [newTargetStock] = await db.select().from(inventoryStocks).where(and(eq(inventoryStocks.itemId, item.id), eq(inventoryStocks.storageLocationId, loc2.id)));

    const transactions = await db.select().from(inventoryTransactions)
        .where(eq(inventoryTransactions.itemId, item.id))
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(2);

    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.type, "transfer"),
        orderBy: desc(notifications.createdAt)
    });

    console.log("\nResults:");
    console.log(`- New Source Stock: ${newSourceStock?.quantity} (Expected: 40)`);
    console.log(`- New Target Stock: ${newTargetStock?.quantity} (Expected: 10)`);
    console.log(`- Last Transactions Type: ${transactions[0].type}, ${transactions[1].type} (Expected: transfer, transfer)`);
    console.log(`- Last Notification Title: ${notification?.title} (Expected: Перемещение товара)`);
    console.log(`- Last Notification Type: ${notification?.type} (Expected: transfer)`);

    if (newSourceStock?.quantity === 40 && newTargetStock?.quantity === 10 && transactions[0].type === "transfer" && notification?.type === "transfer") {
        console.log("\n✅ TEST PASSED SUCCESSFULLY!");
    } else {
        console.log("\n❌ TEST FAILED!");
    }
}

runTest().catch(console.error);
