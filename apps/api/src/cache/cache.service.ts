import { redis } from "./redis";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await redis.set(key, serialized, {
        EX: ttlSeconds,
      });

      return;
    }

    await redis.set(key, serialized);
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);

    return result === 1;
  }

  async clear(): Promise<void> {
    await redis.flushDb();
  }
}

export const cacheService = new CacheService();
