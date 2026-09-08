import type { Redis } from "ioredis";
import { redis } from "@/lib/redis";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Sliding-window rate limiter backed by a Redis sorted set: each request is
 * recorded as a member scored by its timestamp, entries older than the
 * window are trimmed, and the remaining cardinality decides the verdict.
 * More accurate than a fixed-window counter (no burst-at-the-boundary
 * problem) while staying O(log n) per call.
 */
export async function checkRateLimit(
  key: string,
  {
    limit,
    windowMs,
    client = redis,
  }: { limit: number; windowMs: number; client?: Redis },
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `ratelimit:${key}`;

  const pipeline = client.multi();
  pipeline.zremrangebyscore(redisKey, 0, windowStart);
  pipeline.zadd(redisKey, now, `${now}:${Math.random()}`);
  pipeline.zcard(redisKey);
  pipeline.pexpire(redisKey, windowMs);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: now + windowMs,
  };
}
