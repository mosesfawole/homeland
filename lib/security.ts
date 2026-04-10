import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>;
  __upstashRedis?: Redis | null;
};

const rateLimitStore =
  globalForRateLimit.__rateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = rateLimitStore;
}

function getUpstashRedis(): Redis | null {
  if (globalForRateLimit.__upstashRedis !== undefined) {
    return globalForRateLimit.__upstashRedis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    globalForRateLimit.__upstashRedis = null;
    return null;
  }

  const redis = new Redis({ url, token });
  globalForRateLimit.__upstashRedis = redis;
  return redis;
}

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const entry = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, entry);
    return { ok: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function getRequestIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) return first.trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redis = getUpstashRedis();
  if (!redis) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    analytics: true,
  });

  const res = await ratelimit.limit(key);
  return {
    ok: res.success,
    remaining: res.remaining,
    resetAt: typeof res.reset === "number" ? res.reset : Date.now() + windowMs,
  };
}
