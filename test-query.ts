import { db } from "./lib/db";
import { productionTasks } from "./lib/schema";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const start = new Date("2026-03-08T21:00:00.000Z");
    const stats = await db
      .select({
        totalTasks: sql`count(*)`,
        defectTasks: sql`SUM(CASE WHEN ${productionTasks.defectQuantity} > 0 THEN 1 ELSE 0 END)`,
        totalQuantity: sql`SUM(${productionTasks.quantity})`,
        defectQuantity: sql`SUM(${productionTasks.defectQuantity})`,
      })
      .from(productionTasks)
      .where(sql`${productionTasks.completedAt} >= ${start}`);
    console.log("Stats:", stats);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
