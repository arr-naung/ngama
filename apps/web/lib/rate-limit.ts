/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution like @upstash/ratelimit
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed within the window
     */
    limit: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
}

export interface RateLimitResult {
    /**
     * Whether the request is allowed
     */
    allowed: boolean;
    /**
     * Remaining requests in the current window
     */
    remaining: number;
    /**
     * When the rate limit resets (Unix timestamp in ms)
     */
    resetTime: number;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the requester (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = `${identifier}:${config.limit}:${config.windowMs}`;

    const entry = rateLimitStore.get(key);

    // No entry or expired entry - create new
    if (!entry || entry.resetTime < now) {
        const resetTime = now + config.windowMs;
        rateLimitStore.set(key, {
            count: 1,
            resetTime
        });

        return {
            allowed: true,
            remaining: config.limit - 1,
            resetTime
        };
    }

    // Entry exists and is not expired
    if (entry.count < config.limit) {
        entry.count++;
        rateLimitStore.set(key, entry);

        return {
            allowed: true,
            remaining: config.limit - entry.count,
            resetTime: entry.resetTime
        };
    }

    // Rate limit exceeded
    return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
    };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
    /**
     * Strict limit for auth endpoints
     * 5 requests per 15 minutes
     */
    AUTH: {
        limit: 5,
        windowMs: 15 * 60 * 1000
    },
    /**
     * Moderate limit for write operations
     * 10 requests per minute
     */
    WRITE: {
        limit: 10,
        windowMs: 60 * 1000
    },
    /**
     * Lenient limit for read operations
     * 100 requests per minute
     */
    READ: {
        limit: 100,
        windowMs: 60 * 1000
    }
} as const;

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: string): string {
    if (userId) {
        return `user:${userId}`;
    }

    // Try to get IP from various headers (for reverse proxies)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    const ip = (forwarded?.split(',')[0]?.trim()) || realIp || 'unknown';
    return `ip:${ip}`;
}
