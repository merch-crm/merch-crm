"use server";

import { eq } from "drizzle-orm";
import Fuse from "fuse.js";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { withAuth } from "@/lib/action-helpers";
import { CheckDuplicateItemSchema } from "./validation";

import { type ActionResult, ok } from "@/lib/types";

interface DuplicateCheckResult {
  duplicate: { id: string; name: string; sku: string | null } | null;
  type?: "sku_exact" | "name_fuzzy";
  isArchived?: boolean;
  score?: number;
}

/**
 * Check for duplicate items by name or SKU
 */
export async function checkDuplicateItem(name: string, sku?: string, currentItemId?: string): Promise<ActionResult<DuplicateCheckResult | null>> {
  return withAuth<DuplicateCheckResult | null>(async () => {
    const validation = CheckDuplicateItemSchema.safeParse({ name, sku, currentItemId });

    if (!validation.success) {
      return ok(null);
    }

    const allItems = await db.query.inventoryItems.findMany({
      columns: { id: true, name: true, sku: true },
      limit: 2000
    });

    const otherItems = currentItemId ? allItems.filter(i => i.id !== currentItemId) : allItems;

    if (sku && sku !== "") {
      const exactSku = otherItems.find(i => i.sku?.toUpperCase() === sku.toUpperCase());
      if (exactSku) {
        const res = await db.query.inventoryItems.findFirst({
          where: eq(inventoryItems.id, exactSku.id),
          columns: { isArchived: true }
        });
        return ok({
          duplicate: exactSku,
          type: "sku_exact",
          isArchived: res?.isArchived || false
        });
      }
    }

    const fuse = new Fuse(otherItems, {
      keys: ["name"],
      threshold: 0.3,
      includeScore: true
    });

    const results = fuse.search(name);
    if ((results?.length ?? 0) > 0 && (results[0].score ?? 1) < 0.2) {
      return ok({ 
        duplicate: results[0].item, 
        type: "name_fuzzy", 
        score: results[0].score ?? undefined,
        isArchived: false
      });
    }

    return ok(null);
  }, { errorPath: "checkDuplicateItem" });
}
