import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "./index";

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
        cache.invalidateByPattern("prints");
    } else {
        if (collectionId) cache.invalidateByPattern(`prints:collection:${collectionId}`);
        if (designId) cache.invalidateByPattern(`prints:design:${designId}`);
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
    // @ts-expect-error - В Next.js 15 canary revalidateTag может требовать другой сигнатурыversions
    revalidateTag("prints");
}
