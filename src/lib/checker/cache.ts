/**
 * Domain Check Cache
 * In-memory LRU cache + database persistence
 */

import prisma from "@/lib/db";

// In-memory LRU cache
class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private readonly maxSize: number;

    constructor(maxSize: number = 1000) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove oldest (first item)
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export interface CachedResult {
    domain: string;
    status: "available" | "taken" | "unknown";
    source: string;
    checkedAt: Date;
    expiresAt: Date;
    data?: Record<string, unknown>;
}

// Memory cache instance
const memoryCache = new LRUCache<string, CachedResult>(5000);

// TTL values (in seconds)
const AVAILABLE_TTL = parseInt(process.env.CACHE_AVAILABLE_TTL || "3600", 10); // 1 hour
const TAKEN_TTL = parseInt(process.env.CACHE_TAKEN_TTL || "86400", 10); // 24 hours
const UNKNOWN_TTL = 300; // 5 minutes

/**
 * Get TTL based on status
 */
function getTTL(status: string): number {
    switch (status) {
        case "available":
            return AVAILABLE_TTL;
        case "taken":
            return TAKEN_TTL;
        default:
            return UNKNOWN_TTL;
    }
}

/**
 * Get cached result (memory first, then DB)
 */
export async function getCached(domain: string): Promise<CachedResult | null> {
    const lowerDomain = domain.toLowerCase();

    // Check memory cache first
    const memResult = memoryCache.get(lowerDomain);
    if (memResult && memResult.expiresAt > new Date()) {
        return memResult;
    }

    // Check database
    try {
        const dbResult = await prisma.cache.findUnique({
            where: { domain: lowerDomain },
        });

        if (dbResult && dbResult.expiresAt > new Date()) {
            const cached: CachedResult = {
                domain: dbResult.domain,
                status: dbResult.status as "available" | "taken" | "unknown",
                source: dbResult.source,
                checkedAt: dbResult.checkedAt,
                expiresAt: dbResult.expiresAt,
                data: dbResult.data ? JSON.parse(dbResult.data) : undefined,
            };

            // Store in memory cache
            memoryCache.set(lowerDomain, cached);

            return cached;
        }

        // Expired, delete from DB
        if (dbResult) {
            await prisma.cache.delete({
                where: { domain: lowerDomain },
            }).catch(() => { }); // Ignore errors
        }
    } catch (error) {
        console.error("Cache DB read error:", error);
    }

    return null;
}

/**
 * Set cache entry (both memory and DB)
 */
export async function setCache(
    domain: string,
    status: "available" | "taken" | "unknown",
    source: string,
    data?: Record<string, unknown>
): Promise<void> {
    const lowerDomain = domain.toLowerCase();
    const now = new Date();
    const ttl = getTTL(status);
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const cached: CachedResult = {
        domain: lowerDomain,
        status,
        source,
        checkedAt: now,
        expiresAt,
        data,
    };

    // Set in memory cache
    memoryCache.set(lowerDomain, cached);

    // Set in database
    try {
        await prisma.cache.upsert({
            where: { domain: lowerDomain },
            update: {
                status,
                source,
                checkedAt: now,
                expiresAt,
                data: data ? JSON.stringify(data) : null,
            },
            create: {
                domain: lowerDomain,
                status,
                source,
                checkedAt: now,
                expiresAt,
                data: data ? JSON.stringify(data) : null,
            },
        });
    } catch (error) {
        console.error("Cache DB write error:", error);
    }
}

/**
 * Clear expired cache entries from DB
 */
export async function clearExpiredCache(): Promise<number> {
    try {
        const result = await prisma.cache.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    } catch (error) {
        console.error("Cache cleanup error:", error);
        return 0;
    }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
    memoryCache.clear();
    try {
        await prisma.cache.deleteMany({});
    } catch (error) {
        console.error("Cache clear error:", error);
    }
}
