import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    // Merely importing this module (e.g. transitively, while Next analyzes
    // route modules during `next build`) must not open a socket — only an
    // actual command at request time should connect.
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
