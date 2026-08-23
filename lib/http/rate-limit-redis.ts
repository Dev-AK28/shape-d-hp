import { Redis } from '@upstash/redis';
import type { RateLimitOptions } from '@/lib/http/rate-limit';

/**
 * Generic Redis-backed rate limiter.
 *
 * Extracted from `lib/contact/rate-limit-redis.ts` (#475): the Lua scripts
 * were already generic, but the key namespace (`contact:rate:`) and the
 * threshold were hardcoded to the contact form's values. Callers now pass
 * their own `namespace`/`max`/`windowMs` so distinct endpoints (e.g.
 * `/api/contact` vs `/api/csp-report`) don't collide on the same Redis keys
 * or share a threshold that doesn't fit their traffic shape.
 */

export type RedisRateLimitOptions = RateLimitOptions & {
  /** Key namespace prefix, e.g. `contact` -> `contact:rate:<key>`. */
  namespace: string;
};

export type RateLimitService = {
  tryAcquire(key: string): Promise<boolean>;
  release(key: string): Promise<void>;
};

const ACQUIRE_SCRIPT = `
local key = KEYS[1]
local max = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local count = redis.call('INCR', key)
if count == 1 then
  redis.call('PEXPIRE', key, window)
end
if count > max then
  redis.call('DECR', key)
  return 0
end
return 1
`;

const RELEASE_SCRIPT = `
local key = KEYS[1]
local current = redis.call('GET', key)
if not current then
  return 0
end
local count = tonumber(current)
if count <= 1 then
  redis.call('DEL', key)
else
  redis.call('DECR', key)
end
return 1
`;

function rateLimitKey(namespace: string, key: string): string {
  return `${namespace}:rate:${key}`;
}

export function createRedisRateLimitService(
  redis: Redis,
  options: RedisRateLimitOptions,
): RateLimitService {
  return {
    async tryAcquire(key: string): Promise<boolean> {
      const result = await redis.eval(
        ACQUIRE_SCRIPT,
        [rateLimitKey(options.namespace, key)],
        [options.max, options.windowMs],
      );

      return result === 1;
    },

    async release(key: string): Promise<void> {
      await redis.eval(RELEASE_SCRIPT, [rateLimitKey(options.namespace, key)], []);
    },
  };
}

export function createRedisClientFromEnv(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}
