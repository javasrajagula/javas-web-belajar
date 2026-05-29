import { Redis } from "@upstash/redis";

// Simple in-memory fallback for local development or when credentials are missing
class LocalRatelimit {
  private static cache = new Map<string, { hits: number[]; reset: number }>();

  async limit(key: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 15; // 15 requests
    const normalizedKey = normalizeRateLimitKey(key);
    
    const record = LocalRatelimit.cache.get(normalizedKey);
    const activeHits = (record?.hits || []).filter((hit) => now - hit < windowMs);
    const reset = activeHits[0] ? activeHits[0] + windowMs : now + windowMs;
    
    if (activeHits.length >= limit) {
      LocalRatelimit.cache.set(normalizedKey, { hits: activeHits, reset });
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }
    
    activeHits.push(now);
    LocalRatelimit.cache.set(normalizedKey, { hits: activeHits, reset });
    return {
      success: true,
      limit,
      remaining: limit - activeHits.length,
      reset,
      token: String(now),
    };
  }

  async refund(key: string, token?: string) {
    const normalizedKey = normalizeRateLimitKey(key);
    const record = LocalRatelimit.cache.get(normalizedKey);
    if (!record?.hits.length) return;
    if (token) {
      let index = -1;
      for (let i = record.hits.length - 1; i >= 0; i--) {
        if (String(record.hits[i]) === token) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        record.hits.splice(index, 1);
      } else {
        record.hits.pop();
      }
    } else {
      record.hits.pop();
    }
    if (record.hits.length === 0) {
      LocalRatelimit.cache.delete(normalizedKey);
    } else {
      LocalRatelimit.cache.set(normalizedKey, record);
    }
  }
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  token?: string;
}

type AppRatelimiter = {
  limit: (key: string) => Promise<RateLimitResult>;
  refund: (key: string, token?: string) => Promise<void>;
};

class RedisSlidingWindowRatelimit implements AppRatelimiter {
  constructor(private redis: Redis, private options: { limit: number; windowMs: number; prefix: string }) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const normalizedKey = normalizeRateLimitKey(key);
    const redisKey = `${this.options.prefix}:${normalizedKey}`;
    const minScore = now - this.options.windowMs;
    const token = `${now}:${crypto.randomUUID()}`;

    await this.redis.zremrangebyscore(redisKey, 0, minScore);
    const currentCount = await this.redis.zcard(redisKey);
    const oldest = await this.redis.zrange(redisKey, 0, 0, { withScores: true });
    const oldestScore = getFirstScore(oldest);
    const reset = oldestScore ? oldestScore + this.options.windowMs : now + this.options.windowMs;

    if (currentCount >= this.options.limit) {
      return {
        success: false,
        limit: this.options.limit,
        remaining: 0,
        reset,
      };
    }

    await this.redis.zadd(redisKey, { score: now, member: token });
    await this.redis.expire(redisKey, Math.ceil(this.options.windowMs / 1000) + 10);

    return {
      success: true,
      limit: this.options.limit,
      remaining: Math.max(0, this.options.limit - currentCount - 1),
      reset,
      token,
    };
  }

  async refund(key: string, token?: string) {
    if (!token) return;
    const normalizedKey = normalizeRateLimitKey(key);
    const redisKey = `${this.options.prefix}:${normalizedKey}`;
    try {
      await this.redis.zrem(redisKey, token);
    } catch (error) {
      console.warn('Rate limit refund failed:', error);
    }
  }
}

let ratelimiter: AppRatelimiter;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  ratelimiter = new RedisSlidingWindowRatelimit(redis, {
    limit: 15,
    windowMs: 60 * 1000,
    prefix: '@academy-os:rl:tutor',
  });
} else {
  ratelimiter = new LocalRatelimit();
}

function normalizeRateLimitKey(key: string) {
  return key.replace(/[^a-zA-Z0-9:_@.-]/g, '_').slice(0, 160) || 'anonymous';
}

function getFirstScore(value: unknown): number | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const candidate = value[0];
  if (typeof candidate === 'number') return candidate;
  if (Array.isArray(candidate) && typeof candidate[1] === 'number') return candidate[1];
  if (candidate && typeof candidate === 'object' && 'score' in candidate && typeof (candidate as { score?: unknown }).score === 'number') {
    return (candidate as { score: number }).score;
  }
  if (value.length > 1 && typeof value[1] === 'number') return value[1];
  return null;
}

export { ratelimiter };
