
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./lib/db";
import * as schema from "./lib/schema/index";
import { count } from "drizzle-orm";

async function checkData() {
  console.log("--- Production Data Audit ---");
  
  try {
    const [tasksCount] = await db.select({ value: count() }).from(schema.productionTasks);
    console.log(`Production Tasks: ${tasksCount.value}`);
    
    const [inventoryCount] = await db.select({ value: count() }).from(schema.inventoryItems);
    console.log(`Inventory Items: ${inventoryCount.value}`);
    
    const [linesCount] = await db.select({ value: count() }).from(schema.productionLines);
    console.log(`Production Lines: ${linesCount.value}`);
    
    const [equipmentCount] = await db.select({ value: count() }).from(schema.equipment);
    console.log(`Equipment: ${equipmentCount.value}`);
    
    const [ordersCount] = await db.select({ value: count() }).from(schema.orders);
    console.log(`Total Orders: ${ordersCount.value}`);

    const [staffCount] = await db.select({ value: count() }).from(schema.productionStaff);
    console.log(`Production Staff: ${staffCount.value}`);

    // Check status distribution
    const statusDist = await db.select({ 
      status: schema.productionTasks.status, 
      count: count() 
    }).from(schema.productionTasks).groupBy(schema.productionTasks.status);
    console.log("Status Distribution:", JSON.stringify(statusDist));

  } catch (err) {
    console.error("Error checking data:", err);
  } finally {
    process.exit(0);
  }
}

checkData();
