import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory fallback for local development or when credentials are missing
class LocalRatelimit {
  private static cache = new Map<string, { count: number; reset: number }>();

  async limit(key: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 15; // 15 requests
    
    const record = LocalRatelimit.cache.get(key);
    
    if (!record || now > record.reset) {
      LocalRatelimit.cache.set(key, { count: 1, reset: now + windowMs });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }
    
    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.reset,
      };
    }
    
    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.reset,
    };
  }
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

let ratelimiter: { limit: (key: string) => Promise<RateLimitResult> };

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  
  ratelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/academy-os",
  });
} else {
  ratelimiter = new LocalRatelimit();
}

export { ratelimiter };
