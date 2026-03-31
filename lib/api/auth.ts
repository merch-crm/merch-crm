import { db } from "@/lib/db";
import { apiKeys } from "@/lib/schema/api";
import { eq, and } from "drizzle-orm";

/**
 * Checks if the request is authorized via X-API-Key header.
 * Returns the authorized userId or null.
 */
export async function verifyApiKey(request: Request): Promise<string | null> {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) return null;

    const [keyRecord] = await db
        .select({ userId: apiKeys.userId })
        .from(apiKeys)
        .where(and(
            eq(apiKeys.key, apiKey),
            eq(apiKeys.isActive, true)
        ))
        .limit(1);

    if (keyRecord) {
        // Update last used at (background)
        void db.update(apiKeys)
            .set({ lastUsedAt: new Date() })
            .where(eq(apiKeys.key, apiKey));
            
        return keyRecord.userId;
    }

    return null;
}
