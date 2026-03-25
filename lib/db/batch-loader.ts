/**
 * Утилита для пакетной загрузки связанных данных
 * Предотвращает N+1 при необходимости загрузки в циклах
 */

type LoaderFn<K, V> = (keys: K[]) => Promise<Map<K, V>>;

/**
 * Создаёт batch loader для эффективной загрузки связанных данных
 */
export function createBatchLoader<K, V>(loaderFn: LoaderFn<K, V>) {
  const cache = new Map<K, V>();
  const pending = new Map<K, Promise<V | undefined>>();

  return {
    /**
     * Загружает один элемент (с кэшированием и батчингом)
     */
    async load(key: K): Promise<V | undefined> {
      // Проверяем кэш
      if (cache.has(key)) {
        return cache.get(key);
      }

      // Проверяем pending
      if (pending.has(key)) {
        return pending.get(key);
      }

      // Создаём promise для этого ключа
      const promise = (async () => {
        try {
          const results = await loaderFn([key]);
          const value = results.get(key);
          if (value !== undefined) {
            cache.set(key, value);
          }
          return value;
        } finally {
          pending.delete(key);
        }
      })();

      pending.set(key, promise);
      return promise;
    },

    /**
     * Загружает множество элементов одним запросом
     */
    async loadMany(keys: K[]): Promise<Map<K, V>> {
      const uncachedKeys = keys.filter((k) => !cache.has(k));

      if (uncachedKeys.length > 0) {
        const results = await loaderFn(uncachedKeys);
        for (const [key, value] of results) {
          cache.set(key, value);
        }
      }

      const result = new Map<K, V>();
      for (const key of keys) {
        const value = cache.get(key);
        if (value !== undefined) {
          result.set(key, value);
        }
      }

      return result;
    },

    /**
     * Очищает кэш
     */
    clear(): void {
      cache.clear();
      pending.clear();
    },
  };
}
