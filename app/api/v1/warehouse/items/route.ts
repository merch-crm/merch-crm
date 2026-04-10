import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/schema/warehouse/items";
import { verifyApiKey } from "@/lib/api/auth";
import { desc } from "drizzle-orm";

/**
 * Public API: GET /api/v1/warehouse/items
 * Returns a list of warehouse items.
 * Authorization: X-API-Key header.
 */
export async function GET(request: Request) {
  try {
    const userId = await verifyApiKey(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Providing a valid X-API-Key header is required." }, { status: 401 });
    }

    const data = await db.query.inventoryItems.findMany({
      orderBy: [desc(inventoryItems.createdAt)],
      limit: 100,
      with: {
        category: true,
      }
    });

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data
    });
  } catch (error) {
    console.error("[API_V1_ITEMS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
