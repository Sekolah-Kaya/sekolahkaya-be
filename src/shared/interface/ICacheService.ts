export interface ICacheService {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    invalidateKey(pattern: string): Promise<void>;
}
