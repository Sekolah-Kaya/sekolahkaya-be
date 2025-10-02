import { Redis } from 'ioredis'
import { ICacheService } from "../../shared/interface/ICacheService";

export class RedisCache implements ICacheService {
    public constructor(readonly redis: Redis) {}

    async get(key: string): Promise<any> {
        const data = await this.redis.get(key)
        return data ? JSON.parse(data) : null
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const data = JSON.stringify(value)
        if (ttlSeconds) {
            await this.redis.setex(key, ttlSeconds, data)
        } else {
            await this.redis.set(key, data)
        }
    }

    async invalidateKey(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
            await this.redis.del(...keys)
        }
    }
}