/**
 * Модуль кеширования — точка входа
 * 
 * @description Экспортирует Redis-кеш и утилиты.
 */

export {
  redisCache,
  CACHE_TTL,
  CACHE_KEYS,
  INVALIDATION_PATTERNS
} from "./redis-cache";
