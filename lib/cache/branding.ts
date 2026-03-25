import { redisCache, CACHE_TTL, CACHE_KEYS } from "./redis-cache";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";

/**
 * Настройки брендинга с Redis-кешем
 * 
 * @description Кешируется на 15 минут, т.к. меняется редко.
 * Инвалидируется при обновлении через admin-panel.
 */
export async function getCachedBranding() {
  const { data } = await redisCache.getOrSet(
    CACHE_KEYS.branding(),
    async () => {
      const result = await getBrandingSettings();
      return result || { currencySymbol: "₽" };
    },
    { ttl: CACHE_TTL.BRANDING, tags: ["branding"] }
  );
  
  return data;
}

/**
 * Инвалидация кеша брендинга (вызывать при обновлении)
 */
export async function invalidateBrandingCache() {
  await redisCache.delete(CACHE_KEYS.branding());
}
