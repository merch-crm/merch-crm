import { revalidatePath, revalidateTag } from "next/cache";
import { redisCache } from "./index";

/**
 * Инвалидация кэша для принтов и коллекций
 */
export function invalidatePrintsCache(options?: {
    collectionId?: string;
    designId?: string;
    all?: boolean;
}) {
    const { collectionId, designId, all } = options || {};

    // 1. Очистка in-memory кэша
    if (all) {
        redisCache.invalidateByPattern("prints");
    } else {
        if (collectionId) redisCache.invalidateByPattern(`prints:collection:${collectionId}`);
        if (designId) redisCache.invalidateByPattern(`prints:design:${designId}`);
    }

    // 2. Инвалидация путей Next.js
    revalidatePath("/dashboard/design/prints", "page");
    if (collectionId) {
        revalidatePath(`/dashboard/design/prints/${collectionId}`, "page");
    }
    if (collectionId && designId) {
        revalidatePath(`/dashboard/design/prints/${collectionId}/${designId}`, "page");
    }

    // 3. Инвалидация тегов (если используются)
    revalidateTag("prints");
}
