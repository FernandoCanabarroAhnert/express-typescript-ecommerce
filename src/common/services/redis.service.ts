import Redis from "ioredis";
import { env } from "../config/env.config";

export class RedisService {

    private readonly redis = new Redis(env.REDIS_URL);

    async set<T>(key: string, value: T, ttl: number = 180): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), "EX", ttl);
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        if (value) {
            return JSON.parse(value) as T;
        }
        return null;
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async hasKey(key: string): Promise<boolean> {
        return await this.redis.exists(key) === 1;
    }

}