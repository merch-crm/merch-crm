/**
 * Модуль кеширования данных через Redis
 * 
 * @description Обеспечивает распределённое кеширование для всех воркеров Next.js.
 * Используется для статистики, справочников, часто запрашиваемых данных.
 */

import Redis from "ioredis";
import { env } from "@/lib/env";

export const CACHE_TTL = {
  ORDER_STATS: 60,
  CLIENTS_LIST: 300,
  DICTIONARIES: 600,
  USER_DATA: 120,
  BRANDING: 900,
  INVENTORY: 30,
} as const;

export const CACHE_KEYS = {
  orderStats: (range: string) => `crm:stats:orders:${range}`,
  clientsList: () => "crm:clients:list",
  clientsSearch: (query: string) => `crm:clients:search:${query}`,
  userById: (id: string) => `crm:user:${id}`,
  branding: () => "crm:branding",
  inventoryList: (categoryId?: string) => `crm:inventory:list:${categoryId || "all"}`,
  inventoryStats: () => "crm:inventory:stats",
  dictionaries: (type: string) => `crm:dict:${type}`,
} as const;

export const INVALIDATION_PATTERNS = {
  allOrders: "crm:stats:orders:*",
  allClients: "crm:clients:*",
  allInventory: "crm:inventory:*",
  allDictionaries: "crm:dict:*",
  userSpecific: (userId: string) => `crm:user:${userId}*`,
} as const;

interface CacheOptions {
  ttl: number;
  tags?: string[];
}

interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  ttlRemaining?: number;
}

class RedisCache {
  private client: Redis | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private async getClient(): Promise<Redis> {
    if (this.client && this.isConnected) return this.client;
    if (this.connectionPromise) {
      await this.connectionPromise;
      return this.client!;
    }
    this.connectionPromise = this.connect();
    await this.connectionPromise;
    return this.client!;
  }

  private async connect(): Promise<void> {
    const redisHost = env.REDIS_HOST || "127.0.0.1";
    const redisPassword = env.REDIS_PASSWORD;

    this.client = new Redis({
      host: redisHost,
      port: 6379,
      password: redisPassword || undefined,
      db: 1,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      if (process.env.NODE_ENV === "development") {
        console.log("[RedisCache] Подключено к Redis");
      }
    });

    this.client.on("error", (error) => {
      this.isConnected = false;
      console.error("[RedisCache] Ошибка Redis:", error.message);
    });

    this.client.on("close", () => {
      this.isConnected = false;
    });

    try {
      await this.client.connect();
    } catch (error) {
      console.error("[RedisCache] Не удалось подключиться к Redis:", error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`[RedisCache] Ошибка get(${key}):`, error);
      return null;
    }
  }

  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    try {
      const client = await this.getClient();
      await client.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error(`[RedisCache] Ошибка set(${key}):`, error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<CacheResult<T>> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      const ttlRemaining = await this.getTTL(key);
      return { data: cached, fromCache: true, ttlRemaining };
    }
    const data = await fetcher();
    await this.set(key, data, options.ttl);
    if (options.tags?.length) {
      await this.addKeyToTags(key, options.tags);
    }
    return { data, fromCache: false };
  }

  async delete(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      await client.del(key);
    } catch (error) {
      console.error(`[RedisCache] Ошибка delete(${key}):`, error);
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const client = await this.getClient();
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;
      await client.del(...keys);
      if (process.env.NODE_ENV === "development") {
        console.log(`[RedisCache] Инвалидировано ${keys.length} ключей по паттерну ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      console.error(`[RedisCache] Ошибка invalidateByPattern(${pattern}):`, error);
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      const client = await this.getClient();
      const tagKey = `crm:tags:${tag}`;
      const keys = await client.smembers(tagKey);
      if (keys.length === 0) return 0;
      await client.del(...keys, tagKey);
      return keys.length;
    } catch (error) {
      console.error(`[RedisCache] Ошибка invalidateByTag(${tag}):`, error);
      return 0;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      const client = await this.getClient();
      return await client.ttl(key);
    } catch {
      return -1;
    }
  }

  private async addKeyToTags(key: string, tags: string[]): Promise<void> {
    try {
      const client = await this.getClient();
      const pipeline = client.pipeline();
      for (const tag of tags) {
        pipeline.sadd(`crm:tags:${tag}`, key);
        pipeline.expire(`crm:tags:${tag}`, 86400);
      }
      await pipeline.exec();
    } catch (error) {
      console.error("[RedisCache] Ошибка addKeyToTags:", error);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.getClient();
      const pong = await client.ping();
      return pong === "PONG";
    } catch {
      return false;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memoryUsed: string;
  }> {
    try {
      const client = await this.getClient();
      const info = await client.info("memory");
      const dbSize = await client.dbsize();
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      return {
        connected: this.isConnected,
        keys: dbSize,
        memoryUsed: memoryMatch?.[1] || "unknown",
      };
    } catch {
      return { connected: false, keys: 0, memoryUsed: "unknown" };
    }
  }
}

export const redisCache = new RedisCache();
